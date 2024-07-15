import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'fs';

type LsCommand = Command<[string]>;

interface FSInstance extends EmscriptenModule {
    memory: WebAssembly.Memory;
    _list_directory: (pathPtr: number) => number;
    _my_malloc: (size: number) => number;
    _my_free: (ptr: number) => void;
}

export const lsCommand: LsCommand = {
    name: 'ls',
    description: 'List directory contents',
    args: [
        {
            name: 'path',
            type: CommandArgumentTypeEnum.STRING,
            optional: true,
            default: '/'
        }
    ],
    execute: async (path: string = '/') => {
        try {
            const wasmModule = await loadWasmModule<FSInstance>(name, 'js');
            if (wasmModule) {
                const { _list_directory, _my_free, _my_malloc, memory } = wasmModule;

                const encoder = new TextEncoder();
                const decoder = new TextDecoder();

                const pathBuffer = encoder.encode(path + '\0');
                const pathPtr = _my_malloc(pathBuffer.length);
                new Uint8Array(memory.buffer).set(pathBuffer, pathPtr);

                const resultPtr = _list_directory(pathPtr);
                const result = decoder.decode(new Uint8Array(memory.buffer, resultPtr));

                _my_free(pathPtr);
                _my_free(resultPtr);

                return {
                    content: result,
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