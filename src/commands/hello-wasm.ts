import { TerminalStore } from '@/store';
import { Command, CommandArgumentTypeEnum, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'hello-wasm';

type HelloWasmCommand = Command<[number, number]>;

interface HelloWasmInstance extends WebAssembly.Instance {
    exports: {
        add: (num1: number, num2: number) => number;
    }
}


export const helloWasmCommand: HelloWasmCommand = {
    name,
    description: 'Hello World in Web Assembly!',
    args: [
        {
            name: 'numberOne',
            type: CommandArgumentTypeEnum.NUMBER
        },
        {
            name: 'numberTwo',
            type: CommandArgumentTypeEnum.NUMBER
        }
    ],
    execute: async (_: TerminalStore, num1: number, num2: number) => {
        try {
            const helloWasmInstance = await loadWasmModule<HelloWasmInstance>(name, "wasm");
            if (helloWasmInstance) {
                const exports = helloWasmInstance.exports;
                return {
                    content: `Hello World! addResult: ${exports.add(num1, num2)}`,
                    type: CommandResultType.TEXT
                };
            } else {
                throw Error(`Module ${name}.wasm not found.`);
            }
        } catch (error: unknown) {
            return {
                content: `Error executing command ${name}: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};