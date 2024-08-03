import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "ls";

type Args = {
    directory?: string
}

type LsCommand = Command<Args>;

const lsArgs = new ArgumentParser<Args>(name, "List directory contents");

lsArgs.addArgument(['directory'], {
    required: false,
    metavar: 'DIRECTORY_PATH',
    help: "Path to directory"
});

export const lsCommand: LsCommand = {
    name,
    args: lsArgs,
    execute: async (state, args) => {
        try {
            const files = state.fileSystem.listDirectory(args.directory ? args.directory : state.fileSystem.cwd());

            return {
                content: files.join(' '),
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