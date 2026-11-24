import type { FileInfo, TerminalFileSystem } from '@/types/fileSystem';
import type { KernelHandle } from 'unkernel/web';

const ROOT = '/run/portfolio';
const SEED = '/run/portfolio-seed';
const BUSYBOX = '/bin/busybox';
const TOOL_DIR = '/dev/.portfolio-tools';
const TOOLS = `${TOOL_DIR}/busybox`;

export interface PortfolioFiles {
    bin: Record<string, string>;
    commands: Record<string, string>;
    runtime: Record<string, string>;
}
const NO_SUCH_FILE = 'The file does not exist. Please check the file path and try again.';
const DIRECTORY_ERRORS = {
    10: 'The specified directory does not exist. Please check the path and try again.',
    11: 'The specified path is not a directory. Please provide a valid directory path.',
};

type FileOperation = 'command' | 'append' | 'read' | 'list' | 'unlink' | 'mkdir' | 'chdir';

const monthName = new Intl.DateTimeFormat('en', { month: 'short' });
const formatTime = (epochSeconds: string) => {
    const date = new Date(Number(epochSeconds) * 1000);
    const day = String(date.getDate()).padStart(2, ' ');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${monthName.format(date)} ${day} ${hours}:${minutes}`;
};

export class LinuxFileSystem implements TerminalFileSystem {
    private constructor(private readonly kernel: KernelHandle, private directory: string) {}

    static async start(
        files: PortfolioFiles & { help: Record<string, string> },
        home: string,
        signal: AbortSignal,
    ) {
        const { createKernel, checkSupport } = await import('unkernel/web');
        if (!(await checkSupport()).ok) {
            throw new Error('This browser does not support the WebAssembly features needed to run Linux.');
        }
        signal.throwIfAborted();
        const kernel = await createKernel({ worker: true, cpus: 1, memoryMiB: 128, net: undefined, signal });
        try {
            const seed = await kernel.mount(SEED, { ...files }, { readOnly: true });
            const result = await kernel.exec(BUSYBOX, ['sh', `${SEED}/runtime/setup.sh`, ROOT, BUSYBOX, TOOL_DIR, SEED, home], { signal });
            if (result.exitCode !== 0) throw new Error(result.stderr || 'Unable to prepare the guest filesystem.');
            await seed.unmount();
            return new LinuxFileSystem(kernel, home);
        } catch (error) {
            await kernel.stop();
            throw error;
        }
    }

    private run(operation: FileOperation, args: string[], input?: string) {
        return this.kernel.exec(BUSYBOX, [
            'chroot', ROOT, TOOLS, 'sh', `${TOOL_DIR}/filesystem.sh`, this.directory, operation, ...args,
        ], { env: { PATH: TOOL_DIR }, input });
    }

    private check(result: { exitCode: number | null }, message: string, errors: Record<number, string> = {}) {
        if (result.exitCode !== 0) {
            throw new Error('FileSystemException: ' + (errors[result.exitCode ?? -1] ?? message));
        }
    }

    async runPortfolioCommand(command: string, args: string[] = []) {
        const result = await this.run('command', [command, ...args]);
        if (result.exitCode === null || result.exitCode > 1 || result.stderr) {
            throw new Error(result.stderr.trim() || `The ${command} command failed.`);
        }
        return { stdout: result.stdout, exitCode: result.exitCode };
    }

    cwd() {
        return this.directory;
    }

    async writeFile(path: string, data: string) {
        const result = await this.run('append', [path], data);
        this.check(result, 'Cannot open the file for writing. Please check if you have the necessary permissions.', {
            10: NO_SUCH_FILE,
        });
    }

    async readFile(path: string) {
        const result = await this.run('read', [path]);
        this.check(result, 'Cannot open the file for reading. Please check if you have the necessary permissions.', {
            10: NO_SUCH_FILE,
            11: 'The specified path is not a regular file. Please provide a valid file path.',
        });
        return result.stdout;
    }

    async getDetailedDirectoryListing(path: string, showHidden: boolean): Promise<FileInfo[]> {
        const result = await this.run('list', [path, showHidden ? '1' : '0']);
        this.check(result, 'Unable to list the contents of the directory. Please check if you have the necessary permissions.', DIRECTORY_ERRORS);
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
        const result = await this.run('unlink', [path]);
        this.check(result, 'Unable to delete the file or directory. Please check if you have the necessary permissions.', {
            10: 'The file or directory does not exist. Please check the path and try again.',
        });
    }

    async makeDirectory(name: string) {
        const result = await this.run('mkdir', [name]);
        this.check(result, 'Unable to create the directory. Please check if you have the necessary permissions or if a file with the same name already exists.');
    }

    async changeDirectory(path: string) {
        const result = await this.run('chdir', [path]);
        this.check(result, 'Unable to change the directory. Please check if you have the necessary permissions.', DIRECTORY_ERRORS);
        this.directory = result.stdout.slice(0, -1);
    }
}
