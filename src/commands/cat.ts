import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = 'cat';

type Args = {
    file: string
}

type CatCommand = Command<Args>;

const catArgs = new ArgumentParser<Args>(name, "Read file");

catArgs.addArgument(['file'], {
    metavar: 'FILE_PATH',
    help: "Path to file"
});

export const catCommand: CatCommand = {
    name,
    args:catArgs,
    execute: async (state, args) => {
        try {
            const fileContents = state.fileSystem.readFile(args.file);
            return {
                content: fileContents,
                type: CommandResultType.TEXT
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command cat: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};