import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'fs';

type LsCommand = Command<[string]>;

interface FSInstance extends EmscriptenModule {
    _list_directory: (pathPtr: number) => number;
    stringToUTF8: typeof stringToUTF8;
    UTF8ToString: typeof UTF8ToString;
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
                const { _list_directory, _free, _malloc, stringToUTF8, UTF8ToString } = wasmModule;

                // Allocate memory for the input path
                const pathPtr = _malloc(path.length + 1); // +1 for null terminator
                stringToUTF8(path, pathPtr, path.length + 1);

                // Call the WebAssembly function
                const resultPtr = _list_directory(pathPtr);

                // Convert the result to a JavaScript string
                const result = UTF8ToString(resultPtr);

                // Free the allocated memory
                _free(pathPtr);
                _free(resultPtr);

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