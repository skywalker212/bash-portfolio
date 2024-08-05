import { Command, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';
import { ArgumentParser } from 'js-argparse';

const name = "catsay";

type Args = {
    text: string[]
}

type CatsayCommand = Command<Args>;

interface CatsayModule extends EmscriptenModule {
    say: (text: string) => string
}

const catsayArgs = new ArgumentParser<Args>(name, "A talking cat");

catsayArgs.addArgument(['text'], {
    required: false,
    metavar: "TEXT",
    help: "What to say",
    default: ["Meow"],
    nargs: "+"
});

export const catsayCommand: CatsayCommand = {
    name,
    args: catsayArgs,
    execute: async (_, args) => {
        try {

            const catsayModule = await loadWasmModule<CatsayModule>(name, "js");

            const resp = catsayModule.say(args.text.join(" "));
            return {
                content: resp,
                type: CommandResultType.TEXT
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command catsay: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
};