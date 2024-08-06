import { Command, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';
import { ArgumentParser } from 'js-argparse';

const name = 'hello-wasm';
const description = "Hello World in Web Assembly!"

type Args = {
    n1: number,
    n2: number
}

type HelloWasmCommand = Command<Args>;

interface HelloWasmInstance extends WebAssembly.Instance {
    exports: {
        add: (num1: number, num2: number) => number;
    }
}

const helloWasmArgs = new ArgumentParser<Args>(name, description);

helloWasmArgs.addArgument(['n1'], {
    type: 'number',
    metavar: 'NUMBER_ONE',
    help: "First number to add"
});

helloWasmArgs.addArgument(['n2'], {
    type: 'number',
    metavar: 'NUMBER_TWO',
    help: "Second number to add"
});

export const helloWasmCommand: HelloWasmCommand = {
    name,
    args: helloWasmArgs,
    description,
    execute: async (_, args) => {
        try {
            const helloWasmInstance = await loadWasmModule<HelloWasmInstance>(name, "wasm");
            if (helloWasmInstance) {
                const exports = helloWasmInstance.exports;
                return {
                    content: `Hello World! addResult: ${exports.add(args.n1, args.n2)}`,
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