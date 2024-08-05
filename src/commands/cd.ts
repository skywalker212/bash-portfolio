import { HOME_DIR } from '@/config';
import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "cd";

type Args = {
    directory: string
}

type CdCommand = Command<Args>;

const cdArgs = new ArgumentParser<Args>(name, "Change Directory");

cdArgs.addArgument(['directory'], {
    metavar: 'DIRECTORY',
    required: false,
    help: 'Name of the directory',
    default: HOME_DIR
});

export const cdCommand: CdCommand = {
    name,
    args: cdArgs,
    execute: async (state, args) => {
        try {
            state.fileSystem.changeDirectory(args.directory);
            return {
                type: CommandResultType.NONE
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command cd: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};