import { HOME_DIR } from '@/config';
import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "cd";
const description = "Change Directory";

type Args = {
    directory: string
}

type CdCommand = Command<Args>;

const cdArgs = new ArgumentParser<Args>(name, description);

cdArgs.addArgument(['directory'], {
    metavar: 'DIRECTORY',
    required: false,
    help: 'Name of the directory',
    default: HOME_DIR
});

export const cdCommand: CdCommand = {
    name,
    args: cdArgs,
    description,
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