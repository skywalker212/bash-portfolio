import { Command, CommandArgumentTypeEnum, CommandArgumentType, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';

const name = 'hello-wasm';

type HelloWasmCommand = Command<[number, number]>;


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
    execute: async (num1: number, num2: number) => {
        try {
            const helloWasmInstance = await loadWasmModule(name);
            if (helloWasmInstance) {
                const add = helloWasmInstance.instance.exports.add as Function;
                return {
                    content: `Hello World! addResult: ${add(num1, num2)}`,
                    type: CommandResultType.OUTPUT
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