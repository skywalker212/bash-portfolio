import { Command, CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import { commands } from './index';
import { ArgumentParser } from 'js-argparse';

const name = "help";
const description = "List all available commands";

type Args = {
    command_name?: string
}

type HelpCommand = Command<Args>;

const helpArgs = new ArgumentParser<Args>(name, description);

helpArgs.addArgument(["command_name"], {
    required: false,
    metavar: "COMMAND",
    help: "Name of command"
});

export const helpCommand: HelpCommand = {
    name,
    args: helpArgs,
    description,
    execute: (_, args): CommandResult | CommandResult[] | TableCommandResult => {
        if (args.command_name) {
            const command = commands.find(cmd => args.command_name === cmd.name);
            if (command) {
                const ret: CommandResult[] = [
                    {
                        content: command.args.usage(),
                        type: CommandResultType.TEXT
                    },
                ];
                return ret;
            } else {
                return {
                    content: `Command "${args.command_name}" not found.`,
                    type: CommandResultType.ERROR
                };
            }
        } else {
            return [
                {
                    content: [
                        ['Command', 'Description'],
                        ...commands.map(cmd => [cmd.name, cmd.description])
                    ],
                    type: CommandResultType.TABLE,
                    tableType: TableType.BORDERLESS,
                    columns: [{ width: 10 }, { width: 50 }]
                } as TableCommandResult,
                {
                    content: helpArgs.usage(false),
                    type: CommandResultType.TEXT
                },
                {
                    content: "Output redirection using > is also supported",
                    type: CommandResultType.TEXT
                }
            ];
        }
    }
};