import type { TerminalFileSystem } from '@/types/fileSystem';
import type { CommandResult } from '@/types/terminal';
import type { ArgumentParser } from 'js-argparse';

type CommandOutput = CommandResult | CommandResult[];

export interface Command {
    name: string;
    description: string;
    usage(includeDescription?: boolean): string;
    run(fileSystem: TerminalFileSystem, input: string): CommandOutput | Promise<CommandOutput>;
}

export function defineCommand<Args extends Record<string, unknown>>({
    name, description, args, execute,
}: {
    name: string;
    description: string;
    args: ArgumentParser<Args>;
    execute(fileSystem: TerminalFileSystem, args: Args): CommandOutput | Promise<CommandOutput>;
}): Command {
    return {
        name,
        description,
        usage: includeDescription => args.usage(includeDescription),
        run: (fileSystem, input) => {
            // The parser checks required arguments and applies defaults before returning.
            return execute(fileSystem, args.parseArgs(input) as Args);
        },
    };
}
