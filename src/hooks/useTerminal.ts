import { useState, useCallback } from 'react';
import { handleCommand } from '@/utils/commandHandler';
import { CommandResult } from '@/types';
import { LinuxFileSystem } from '@/utils';

export const useTerminal = (initialOutput: CommandResult[] = []) => {
    const [output, setOutput] = useState<CommandResult[]>(initialOutput);

    const executeCommand = useCallback(async (command: string, fileSystem: LinuxFileSystem) => {
        const commandResult = await handleCommand(command, fileSystem);
        return commandResult;
    }, []);

    const clearTerminal = useCallback(() => {
        setOutput([]);
    }, []);

    return { output, setOutput, executeCommand, clearTerminal };
};