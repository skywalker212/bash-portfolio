import { Command, CommandResultType } from '@/types';

export const clearCommand: Command = {
    name: 'clear',
    description: 'Clear the terminal screen',
    execute: () => {
        return {
            content: 'CLEAR_TERMINAL',
            type: CommandResultType.CUSTOM
        };
    }
};