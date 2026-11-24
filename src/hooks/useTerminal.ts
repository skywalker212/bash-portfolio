import { useState, useCallback } from 'react';
import { handleCommand } from '@/utils/commandHandler';
import { CommandResult } from '@/types';
import { TerminalStore } from '@/store';
import { LinuxFileSystem } from '@/utils';

export const useTerminal = (initialOutput: CommandResult[] = [], terminalStore: TerminalStore) => {
    const [output, setOutput] = useState<CommandResult[]>(initialOutput);

    const executeCommand = useCallback(async (command: string, fileSystem: LinuxFileSystem) => {
        const commandResult = await handleCommand(command, terminalStore, fileSystem);
        return commandResult;
    }, [terminalStore]);

    const clearTerminal = useCallback(() => {
        setOutput([]);
    }, []);

    return { output, setOutput, executeCommand, clearTerminal };
};