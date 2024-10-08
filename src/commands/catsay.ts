import { MainModule as CatSayModule } from '@/public/wasm/catsay/catsay';
import { Command, CommandResultType } from '@/types';
import { loadWasmModule } from '@/utils';
import { ArgumentParser } from 'js-argparse';

const name = "catsay";
const description = "A talking cat";

type Args = {
    text: string[]
}

type CatsayCommand = Command<Args>;

const catsayArgs = new ArgumentParser<Args>(name, description);

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
    description,
    execute: async (_, args) => {
        try {

            const catsayModule = await loadWasmModule<CatSayModule>(name, "js");

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