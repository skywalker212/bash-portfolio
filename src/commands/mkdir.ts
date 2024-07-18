import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';

type MkdirCommand = Command<[string]>;

export const mkdirCommand: MkdirCommand = {
    name: 'mkdir',
    description: 'Make new Directory',
    args: [
        {
            name: 'Directory Name',
            type: CommandArgumentTypeEnum.STRING
        }
    ],
    execute: async (state, directoryName: string) => {
        try {

            state.fileSystem.makeDirectory(directoryName);

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