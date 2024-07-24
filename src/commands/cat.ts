import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';

type CatCommand = Command<[string]>;

export const catCommand: CatCommand = {
    name: 'cat',
    description: 'Read file',
    args: {
        required: [
            {
                name: 'path',
                type: CommandArgumentTypeEnum.STRING
            }
        ]
    },
    execute: async (state, path: string) => {
        try {
            const fileContents = state.fileSystem.readFile(path);
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