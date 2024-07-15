import { Command, CommandArgumentTypeEnum, CommandResult, CommandResultType } from '@/types';
import { commands } from './index';

type HelpCommand = Command<[string]>;

export const helpCommand: HelpCommand = {
    name: 'help',
    description: "List all available commands. Type 'help <command>' to see command related help.",
    args: [
        {
            name: 'commandName',
            type: CommandArgumentTypeEnum.STRING,
            optional: true
        }
    ],
    execute: (commandName: string) => {
        if (commandName) {
            const command = commands.find(cmd => commandName === cmd.name);
            if (command) {
                const ret: CommandResult[] = [
                    {
                        content: command.description,
                        type: CommandResultType.TEXT
                    },
                ];
                if (command.args) {
                    ret.push({
                        content: [
                            ['Name', 'Type', 'Required'],
                            ...command.args.map(arg => [arg.name, arg.type, !arg.optional])
                        ],
                        type: CommandResultType.TABLE
                    })
                }
                return ret;
            } else {
                return {
                    content: `Command "${commandName}" not found.`,
                    type: CommandResultType.ERROR
                };
            }
        } else {
            const commandList = commands.map(cmd => [cmd.name, cmd.description]);
            return {
                content: [
                    ['Command', 'Description'],
                    ...commandList
                ],
                type: CommandResultType.TABLE
            };
        }
    }
};