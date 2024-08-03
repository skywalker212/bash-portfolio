import { Command, CommandResult, CommandResultType, TableCommandResult } from '@/types';
import { commands } from './index';
import { ArgumentParser } from 'js-argparse';

const name = "help";

type Args = {
    command_name?: string
}

type HelpCommand = Command<Args>;

const helpArgs = new ArgumentParser<Args>(name, "List all available commands");

helpArgs.addArgument(["command_name"], {
    required: false,
    metavar: "COMMAND",
    help: "Name of command"
});

export const helpCommand: HelpCommand = {
    name,
    args: helpArgs,
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
                    content: <b>Available Commands</b>,
                    type: CommandResultType.CUSTOM
                },
                {
                    content: commands.map(cmd => cmd.name).join(" "),
                    type: CommandResultType.TEXT
                },
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