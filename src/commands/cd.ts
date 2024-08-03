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
    help: 'Name of the directory'
});

export const cdCommand: CdCommand = {
    name,
    args: cdArgs,
    execute: async (state, args) => {
        try {
            state.fileSystem.changeDirectory(args.directory ? args.directory : HOME_DIR)
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