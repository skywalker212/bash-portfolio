import { useState, useCallback } from 'react';
import { handleCommand } from '@/utils/commandHandler';
import { CommandResult } from '@/types';

export const useTerminal = (initialOutput: CommandResult[] = []) => {
    const [output, setOutput] = useState<CommandResult[]>(initialOutput);

    const executeCommand = useCallback(async (command: string) => {
        const commandResult = await handleCommand(command);
        return commandResult;
    }, []);

    const clearTerminal = useCallback(() => {
        setOutput([]);
    }, []);

    return { output, setOutput, executeCommand, clearTerminal };
};