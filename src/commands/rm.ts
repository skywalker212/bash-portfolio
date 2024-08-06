import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "rm";
const description = "Remove directory entries";

type Args = {
    file: string 
}

type RmCommand = Command<Args>;

const rmArgs = new ArgumentParser<Args>(name, description);

rmArgs.addArgument(['file'], {
    metavar: "FILE_NAME",
    help: "Name of file to remove"
});

export const rmCommand: RmCommand = {
    name,
    args: rmArgs,
    description,
    execute: async (state, args) => {
        try {

            await state.fileSystem.unlink(args.file);

            return {
                type: CommandResultType.NONE
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command rm: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};