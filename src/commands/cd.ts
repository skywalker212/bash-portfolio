import { TerminalStore } from '@/store';
import { Command, CommandArgumentTypeEnum, CommandResultType, FSInstance } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'fs';

type CdCommand = Command<[string]>;

export const cdCommand: CdCommand = {
    name: 'cd',
    description: 'Change Directory',
    args: [
        {
            name: 'Directory Name',
            type: CommandArgumentTypeEnum.STRING,
        }
    ],
    execute: async (terminalStore: TerminalStore, path: string) => {
        try {
            const wasmModule = await loadWasmModule<FSInstance>(name, 'js');
            if (wasmModule) {
                const { FS } = wasmModule;

                FS.chdir(path);
                terminalStore.changeDirectory(FS.cwd());

                return {
                    type: CommandResultType.NONE
                };
            } else {
                throw Error(`Module ${name} not found.`);
            }
        } catch (error: unknown) {
            return {
                content: `Error executing command cd: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};