import { CommandResultType } from '@/types/terminal';
import { defineCommand } from './command';
import { ArgumentParser } from 'js-argparse';

const name = "rm";
const description = "Remove directory entries";

type Args = {
    file: string 
}

const rmArgs = new ArgumentParser<Args>(name, description);

rmArgs.addArgument(['file'], {
    metavar: "FILE_NAME",
    help: "Name of file to remove"
});

export const rmCommand = defineCommand({
    name,
    args: rmArgs,
    description,
    execute: async (fileSystem, args) => {
        try {

            await fileSystem.unlink(args.file);

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
});
