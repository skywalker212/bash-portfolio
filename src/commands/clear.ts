import { Command } from '@/types';

type ClearCommand = Omit<Command<[]>, 'execute'>;

export const clearCommand: ClearCommand = {
    name: 'clear',
    description: 'Clear the terminal screen'
};