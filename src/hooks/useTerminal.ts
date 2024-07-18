import { useState, useCallback } from 'react';
import { handleCommand } from '@/utils/commandHandler';
import { CommandResult } from '@/types';
import { TerminalStore } from '@/store';
import { WASMFileSystem } from '@/utils';

export const useTerminal = (initialOutput: CommandResult[] = [], terminalStore: TerminalStore, fileSystem: WASMFileSystem) => {
    const [output, setOutput] = useState<CommandResult[]>(initialOutput);

    const executeCommand = useCallback(async (command: string) => {
        const commandResult = await handleCommand(command, terminalStore, fileSystem);
        return commandResult;
    }, [terminalStore, fileSystem]);

    const clearTerminal = useCallback(() => {
        setOutput([]);
    }, []);

    return { output, setOutput, executeCommand, clearTerminal };
};