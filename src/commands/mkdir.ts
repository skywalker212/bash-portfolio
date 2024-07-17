import { TerminalStore } from '@/store';
import { Command, CommandArgumentTypeEnum, CommandResultType, FSInstance } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'fs';

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
    execute: async (_: TerminalStore, directoryName: string) => {
        try {
            const wasmModule = await loadWasmModule<FSInstance>(name, 'js');
            if (wasmModule) {
                const { FS } = wasmModule;

                FS.mkdir(directoryName)
                FS.syncfs((e: Error) => {
                    if (e) {
                        throw e;
                    }
                })

                return {
                    type: CommandResultType.NONE
                };
            } else {
                throw Error(`Module ${name} not found.`);
            }
        } catch (error: unknown) {
            return {
                content: `Error executing command mkdir: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};