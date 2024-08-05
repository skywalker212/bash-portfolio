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

            for (const dir of directories) {
                if (directories.length > 1) {
                    output += `${dir}:\n`;
                }
                const files = state.fileSystem.getDetailedDirectoryListing(dir, args.all);
                if (args.long) {
                    for (const file of files) {
                        output += `${file.permissions} ${file.owner} ${file.group} ${file.size.toString().padStart(8)} ${file.modTime} ${file.name}${file.isDirectory ? '/' : ''}\n`;
                    }
                } else {
                    output += files.map(file => file.name + (file.isDirectory ? '/' : '')).join(' ') + '\n';
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