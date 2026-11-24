import { CommandResultType } from '@/types/terminal';
import { defineCommand } from './command';
import { ArgumentParser } from 'js-argparse';

const name = 'cat';
const description = "Read file";

type Args = {
    file: string
}

const catArgs = new ArgumentParser<Args>(name, description);

catArgs.addArgument(['file'], {
    metavar: 'FILE_PATH',
    help: "Path to file"
});

export const catCommand = defineCommand({
    name,
    args:catArgs,
    description,
    execute: async (fileSystem, args) => {
        try {
            const fileContents = await fileSystem.readFile(args.file);
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
});
