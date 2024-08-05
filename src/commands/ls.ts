import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "ls";

type Args = {
    all: boolean;
    long: boolean;
    directory?: string[];
}

type LsCommand = Command<Args>;

const lsArgs = new ArgumentParser<Args>(name, "List directory contents");

lsArgs.addArgument(['-a', '--all'], {
    type: "boolean",
    default: false,
    help: "Do not ignore entries starting with ."
});

lsArgs.addArgument(['-l', '--long'], {
    type: "boolean",
    default: false,
    help: "Use a long listing format"
});

lsArgs.addArgument(['directory'], {
    nargs: '*',
    required: false,
    metavar: 'DIRECTORY',
    help: "Directory to list (defaults to current directory if not specified)"
});

export const lsCommand: LsCommand = {
    name,
    args: lsArgs,
    execute: async (state, args) => {
        try {
            const directories = args.directory && args.directory.length > 0 ? args.directory : [state.fileSystem.cwd()];
            let output = "";

            const formatSize = (size: bigint) => {
                const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
                let unitIndex = 0;
                const divisor = BigInt(1024);
                while (size >= divisor && unitIndex < units.length - 1) {
                    size = size / divisor;
                    unitIndex++;
                }
                return unitIndex === 0 ? size.toString() : Number(size).toFixed(1) + units[unitIndex];
            }

            for (const dir of directories) {
                if (directories.length > 1) {
                    output += `${dir}:\n`;
                }
                const files = state.fileSystem.getDetailedDirectoryListing(dir, args.all);

                if (args.long) {
                    const linkCountWidth = Math.max(...files.map(f => f.linkCount.toString().length));
                    const ownerWidth = Math.max(...files.map(f => f.owner.toString().length));
                    const groupWidth = Math.max(...files.map(f => f.group.toString().length));
                    const sizeWidth = Math.max(...files.map(f => formatSize(f.size).length));

                    for (const file of files) {
                        const formattedSize = formatSize(file.size);
                        let line = `${file.permissions} `;
                        line += `${file.linkCount.toString().padStart(linkCountWidth)} `;
                        line += `${file.owner.toString().padEnd(ownerWidth)} `;
                        line += `${file.group.toString().padEnd(groupWidth)} `;
                        line += `${formattedSize.padStart(sizeWidth)} `;
                        line += `${file.modTime} `;
                        line += file.name;

                        if (file.isSymlink) {
                            line += ` -> ${file.linkTarget}`;
                        } else if (file.isDirectory && file.name !== "." && file.name !== "..") {
                            line += '/';
                        }

                        output += line + '\n';
                    }
                } else {
                    output += files.map(file => {
                        let name = file.name;
                        if (file.isDirectory && file.name !== "." && file.name !== "..") {
                            name += '/';
                        }
                        return name;
                    }).join('  ') + '\n';
                }
            }

            return {
                content: output.trim(),
                type: CommandResultType.TEXT
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command ls: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};