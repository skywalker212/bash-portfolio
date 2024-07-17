import { TerminalStore } from '@/store';
import { Command, CommandArgumentTypeEnum, CommandResultType, FSInstance } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'fs';

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
    execute: async (terminalStore: TerminalStore, path: string) => {
        try {
            const wasmModule = await loadWasmModule<FSInstance>(name, 'js');
            if (wasmModule) {
                const { FS } = wasmModule;

                const files = FS.readdir(path ? path : terminalStore.currentDirectory);

                return {
                    content: files.join(' '),
                    type: CommandResultType.TEXT
                };
            } else {
                throw Error(`Module ${name} not found.`);
            }
        } catch (error: unknown) {
            return {
                content: `Error executing command ls: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};