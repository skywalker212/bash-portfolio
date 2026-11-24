import { HOME_DIR } from '@/config';
import type { KernelHandle } from 'unkernel/web';

interface FileInfo {
    permissions: string;
    linkCount: number;
    owner: string;
    group: string;
    size: number;
    modTime: string;
    name: string;
    isDirectory: boolean;
    isSymlink: boolean;
    linkTarget: string;
}

const ROOT = '/run/portfolio';
const SEED = '/run/portfolio-seed';
const BUSYBOX = '/bin/busybox';
const TOOL_DIR = '/dev/.portfolio-tools';
const TOOLS = `${TOOL_DIR}/busybox`;

export interface PortfolioFiles {
    bin: Record<string, string>;
    commands: Record<string, string>;
}
const NO_SUCH_DIRECTORY = 'The specified directory does not exist. Please check the path and try again.';
const NOT_A_DIRECTORY = 'The specified path is not a directory. Please provide a valid directory path.';
const NO_SUCH_FILE = 'The file does not exist. Please check the file path and try again.';
const ERROR_PREFIX = 'FileSystemException: ';

const directoryChecks = `
[ -e "$1" ] || exit 10
[ -d "$1" ] || exit 11
`;

const setup = `
set -e
umask 000
mkdir -p "$1/bin" "$1/dev/shm/tmp" "$1/proc/self/fd" "$1/tmp" "$1$5"
mknod -m 666 "$1/dev/null" c 1 3
mknod -m 555 "$1/dev/random" c 1 8
mknod -m 555 "$1/dev/urandom" c 1 9
mknod -m 666 "$1/dev/tty" c 5 0
mknod -m 666 "$1/dev/tty1" c 4 1
ln -s /dev/tty "$1/dev/stdin"
ln -s /dev/tty "$1/dev/stdout"
ln -s /dev/tty1 "$1/dev/stderr"
mkdir -p "$1\${3%/*}"
cp "$2" "$1$3"
cp "$4/bin/"* "$1/bin/"
cp -R "$4/commands" "$4/help" "$1\${3%/*}/"
ln -s busybox "$1\${3%/*}/cat"
ln -s busybox "$1\${3%/*}/awk"
chmod 777 "$1/bin/"*
ln -s /bin/projects "$1$5/projects"
ln -s /bin/skills "$1$5/skills"
`;

const list = String.raw`
cd -- "$1" || exit 1
if [ "$2" = 1 ]; then
    set -- . .. .[!.]* ..?* *
else
    set -- *
fi

for name do
    [ -e "$name" ] || [ -L "$name" ] || continue
    [ "$PWD/$name" != '/dev/.portfolio-tools' ] || continue
    info=$("$BOX" stat -c '%A %h %u %g %s %Y' -- "$name") || exit 1
    printf '%s\0%s\0' "$name" "$info"
    if [ -L "$name" ]; then
        "$BOX" readlink -n -- "$name" || exit 1
    fi
    printf '\0'
done
`;

const monthName = new Intl.DateTimeFormat('en', { month: 'short' });
const formatTime = (epochSeconds: string) => {
    const date = new Date(Number(epochSeconds) * 1000);
    const day = String(date.getDate()).padStart(2, ' ');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${monthName.format(date)} ${day} ${hours}:${minutes}`;
};

export class LinuxFileSystem {
    private directory = HOME_DIR;

    private constructor(private readonly kernel: KernelHandle) {}

    static async start({ bin, commands }: PortfolioFiles, help: Record<string, string>, signal: AbortSignal) {
        const { createKernel, checkSupport } = await import('unkernel/web');
        if (!(await checkSupport()).ok) {
            throw new Error('This browser does not support the WebAssembly features needed to run Linux.');
        }
        signal.throwIfAborted();
        const kernel = await createKernel({ worker: true, cpus: 1, memoryMiB: 128, net: undefined, signal });
        try {
            const seed = await kernel.mount(SEED, { bin, commands, help }, { readOnly: true });
            const result = await kernel.exec(BUSYBOX, ['sh', '-c', setup, 'sh', ROOT, BUSYBOX, TOOLS, SEED, HOME_DIR], { signal });
            if (result.exitCode !== 0) throw new Error(result.stderr || 'Unable to prepare the guest filesystem.');
            await seed.unmount();
            return new LinuxFileSystem(kernel);
        } catch (error) {
            await kernel.stop();
            throw error;
        }
    }

    private run(script: string, args: string[], input?: string) {
        // Use a private Linux root for the portfolio and pass paths as arguments.
        return this.kernel.exec(BUSYBOX, [
            'chroot', ROOT, TOOLS, 'sh', '-c',
            'cd -- "$1" || exit 1; shift; umask 000; ' + script,
            'sh', this.directory, ...args,
        ], { env: { BOX: TOOLS, PATH: TOOL_DIR }, input });
    }

    private check(result: { exitCode: number | null }, message: string, errors: Record<number, string> = {}) {
        if (result.exitCode !== 0) {
            throw new Error(ERROR_PREFIX + (errors[result.exitCode ?? -1] ?? message));
        }
    }

    async runPortfolioCommand(command: string, args: string[] = []) {
        const result = await this.run('"$BOX" sh "$@"', [`${TOOL_DIR}/commands/${command}.sh`, ...args]);
        if (result.exitCode === null || result.exitCode > 1 || result.stderr) {
            throw new Error(result.stderr.trim() || `The ${command} command failed.`);
        }
        return result;
    }

    cwd() {
        return this.directory;
    }

    async writeFile(path: string, data: string) {
        const result = await this.run('"$BOX" cat >> "$1"', [path], data);
        this.check(result, 'Cannot open the file for writing. Please check if you have the necessary permissions.');
    }

    async readFile(path: string) {
        const result = await this.run(`
            [ -e "$1" ] || exit 10
            [ -f "$1" ] || exit 11
            "$BOX" cat -- "$1"
        `, [path]);
        this.check(result, 'Cannot open the file for reading. Please check if you have the necessary permissions.', {
            10: NO_SUCH_FILE,
            11: 'The specified path is not a regular file. Please provide a valid file path.',
        });
        return result.stdout;
    }

    async getDetailedDirectoryListing(path: string, showHidden: boolean): Promise<FileInfo[]> {
        const result = await this.run(directoryChecks + list, [path, showHidden ? '1' : '0']);
        this.check(result, 'Unable to list the contents of the directory. Please check if you have the necessary permissions.', {
            10: NO_SUCH_DIRECTORY,
            11: NOT_A_DIRECTORY,
        });
        const fields = result.stdout.split('\0');
        const files: FileInfo[] = [];
        for (let i = 0; i < fields.length - 1; i += 3) {
            const [name, stat, linkTarget] = fields.slice(i, i + 3);
            const [permissions, links, uid, gid, size, mtime] = stat.split(' ');
            const isDirectory = permissions.startsWith('d');
            files.push({
                name,
                permissions: (isDirectory ? 'd' : '-') + permissions.slice(1),
                // Keep the existing long-listing display for directories.
                linkCount: isDirectory ? 1 : Number(links),
                owner: uid,
                group: gid,
                size: isDirectory ? 4096 : Number(size),
                modTime: formatTime(mtime),
                isDirectory,
                isSymlink: permissions.startsWith('l'),
                linkTarget,
            });
        }

        return files.sort((a, b) =>
            Number(b.isDirectory) - Number(a.isDirectory) || (a.name < b.name ? -1 : Number(a.name > b.name)));
    }

    async unlink(path: string) {
        const result = await this.run(`
            [ -e "$1" ] || exit 10
            if [ -d "$1" ] && ! [ -L "$1" ]; then
                "$BOX" rmdir -- "$1"
            else
                "$BOX" rm -- "$1"
            fi
        `, [path]);
        this.check(result, 'Unable to delete the file or directory. Please check if you have the necessary permissions.', {
            10: 'The file or directory does not exist. Please check the path and try again.',
        });
    }

    async makeDirectory(name: string) {
        const result = await this.run('[ -d "$1" ] || "$BOX" mkdir -- "$1"', [name]);
        this.check(result, 'Unable to create the directory. Please check if you have the necessary permissions or if a file with the same name already exists.');
    }

    async changeDirectory(path: string) {
        const result = await this.run(directoryChecks + 'cd -- "$1" && pwd -P', [path]);
        this.check(result, 'Unable to change the directory. Please check if you have the necessary permissions.', {
            10: NO_SUCH_DIRECTORY,
            11: NOT_A_DIRECTORY,
        });
        this.directory = result.stdout.slice(0, -1);
    }
}
