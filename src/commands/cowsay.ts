import { Command, CommandResultType, WasmModule } from '@/types';
import { loadWasmModule } from '@/utils';

export const cowsayCommand: Command = {
    name: 'cowsay',
    description: 'A talking cow!',
    execute: async (args: string[]) => {
        const cowsayModule = await loadWasmModule('cowsay', {wasi_snapshot_preview1:{}});
        return {
            content: 'Moo',
            type: CommandResultType.OUTPUT
        };
    }
};