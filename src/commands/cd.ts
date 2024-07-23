import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';

type CdCommand = Command<[string]>;

export const cdCommand: CdCommand = {
    name: 'cd',
    description: 'Change Directory',
    args: {
        optional: [
            {
                name: 'directory_name',
                type: CommandArgumentTypeEnum.STRING,
            }
        ]
    },
    execute: async (state, path: string) => {
        try {
            state.fileSystem.changeDirectory(path)
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