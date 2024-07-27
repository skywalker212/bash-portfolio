import { Command, CommandArgumentTypeEnum, CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import { commands } from './index';
import { generateUsageString } from '@/utils';

type HelpCommand = Command<[string]>;

export const helpCommand: HelpCommand = {
    name: 'help',
    description: "List all available commands",
    args: {
        optional: [
            {
                name: 'command_name',
                type: CommandArgumentTypeEnum.STRING
            }
        ]
    },
    execute: (_, commandName: string): CommandResult | CommandResult[] | TableCommandResult => {
        if (commandName) {
            const command = commands.find(cmd => commandName === cmd.name);
            if (command) {
                const ret: CommandResult[] = [
                    {
                        content: command.description,
                        type: CommandResultType.TEXT
                    },
                    {
                        content: generateUsageString(command),
                        type: CommandResultType.TEXT
                    },
                ];
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
                type: CommandResultType.TABLE,
                tableType: TableType.BORDERLESS,
                columns: [{width: 10}, {width: 50}]
            };
        }
    }
};