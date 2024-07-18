import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';

type LsCommand = Command<[string]>;

export const lsCommand: LsCommand = {
    name: 'ls',
    description: 'List directory contents',
    args: [
        {
            name: 'path',
            type: CommandArgumentTypeEnum.STRING,
            optional: true
        }
    ],
    execute: async (state, path: string) => {
        try {
            const files = state.fileSystem.listDirectory(path);

            return {
                content: files.join(' '),
                type: CommandResultType.TEXT
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command ls: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};