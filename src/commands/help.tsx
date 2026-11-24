import { Command, CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import { commands } from './index';
import { ArgumentParser } from 'js-argparse';

const name = "help";
const description = "List all available commands";

type Args = {
    command_name?: string
};

interface HelpList {
    commands: string[][];
    usage: string;
    redirection: string;
}

const helpArgs = new ArgumentParser<Args>(name, description);
helpArgs.addArgument(["command_name"], {
    required: false,
    metavar: "COMMAND",
    help: "Name of command"
});

export function buildHelpFiles(): Record<string, string> {
    const list: HelpList = {
        commands: commands.map(command => [command.name, command.description]),
        usage: helpArgs.usage(false),
        redirection: 'Output redirection using > is also supported',
    };
    return Object.fromEntries([
        ['.list', JSON.stringify(list)],
        ...commands.map(command => [command.name, command.args.usage()]),
    ]);
}

export const helpCommand: Command<Args> = {
    name,
    args: helpArgs,
    description,
    execute: async ({ fileSystem }, args): Promise<CommandResult | CommandResult[]> => {
        const { stdout, exitCode } = await fileSystem.runPortfolioCommand('help', args.command_name ? [args.command_name] : []);
        if (exitCode === 1) {
            return {
                content: `Command "${args.command_name}" not found.`,
                type: CommandResultType.ERROR
            };
        }
        if (args.command_name) {
            return { content: stdout, type: CommandResultType.TEXT };
        }
        const list = JSON.parse(stdout) as HelpList;
        const table: TableCommandResult = {
            content: [['Command', 'Description'], ...list.commands],
            type: CommandResultType.TABLE,
            tableType: TableType.BORDERLESS,
            columns: [{ width: 10 }, { width: 50 }],
        };
        return [
            table,
            { content: list.usage, type: CommandResultType.TEXT },
            { content: list.redirection, type: CommandResultType.TEXT },
        ];
    }
};
