import { CommandResultType } from '@/types/terminal';
import { defineCommand } from './command';
import { ArgumentParser } from 'js-argparse';

const name = "catsay";
const description = "A talking cat";

type Args = {
    text: string[]
}

const catsayArgs = new ArgumentParser<Args>(name, description);

catsayArgs.addArgument(['text'], {
    required: false,
    metavar: "TEXT",
    help: "What to say",
    default: ["Meow"],
    nargs: "+"
});

export const catsayCommand = defineCommand({
    name,
    args: catsayArgs,
    description,
    execute: async (fileSystem, args) => {
        try {
            const { stdout, exitCode } = await fileSystem.runPortfolioCommand(name, [args.text.join(" ")]);
            if (exitCode === 1) {
                // Preserve the displayed error for inputs that overflow the original bubble.
                throw new Error('Aborted(). Build with -sASSERTIONS for more info.');
            }
            return {
                content: stdout,
                type: CommandResultType.TEXT
            };
        } catch (error: unknown) {
            return {
                content: `Error executing command catsay: ${(error as Error).message}`,
                type: CommandResultType.ERROR
            };
        }
    }
});
