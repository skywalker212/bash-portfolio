import { Command, CommandResultType } from '@/types';
import { commands } from './index';

export const helpCommand: Command = {
    name: 'help',
    description: 'List all available commands',
    execute: () => {
        const commandList = commands.map(cmd => [cmd.name, cmd.description]);
        return {
            content: [
                ['Command', 'Description'],
                ...commandList
            ],
            type: CommandResultType.TABLE
        };
    }
};