import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "mkdir";
const description = "Make new Directory";

type Args = {
    directory_name: string 
}

type MkdirCommand = Command<Args>;

const mkdirArgs = new ArgumentParser<Args>(name, description);

mkdirArgs.addArgument(['directory_name'], {
    metavar: "DIRECTORY_NAME",
    help: "Name of new directory"
});

export const mkdirCommand: MkdirCommand = {
    name,
    args: mkdirArgs,
    description,
    execute: async (state, args) => {
        try {

            await state.fileSystem.makeDirectory(args.directory_name);

            return {
                type: CommandResultType.NONE
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command mkdir: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};