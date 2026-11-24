'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import TerminalInput from './TerminalInput';
import { useKeyboardNavigation, useTerminal, useAutoFocus } from '@/hooks';
import styles from '@/styles/Terminal.module.css';
import { CommandResultType } from '@/types';
import { getPrompt, LinuxFileSystem, type PortfolioFiles } from '@/utils';
import { useTerminalStore, getPreviousCommand, getNextCommand } from '@/store';
import { initialRender } from '@/config';
import Output from './Output';

const Terminal = ({ files }: { files: PortfolioFiles }) => {
    const [input, setInput] = useState('');
    const terminalStore = useTerminalStore();
    const { currentDirectory, addCommandToHistory, changeDirectory } = terminalStore;
    const { output, setOutput, executeCommand, clearTerminal } = useTerminal(initialRender, terminalStore);
    const inputRef = useAutoFocus();
    const terminalRef = useRef<HTMLDivElement>(null);
    const [fileSystem, setFileSystem] = useState<LinuxFileSystem | null>(null);
    const pending = useRef(Promise.resolve());

    const queueClear = useCallback(() => {
        pending.current = pending.current.then(clearTerminal);
    }, [clearTerminal]);

    const handleSubmit = useCallback(() => {
        const trimmedInput = input.trim();
        if (!trimmedInput || !fileSystem) return;

        addCommandToHistory(trimmedInput);
        setInput('');
        if (trimmedInput === 'clear') {
            queueClear();
            return;
        }

        pending.current = pending.current.then(async () => {
            const directory = fileSystem.cwd();
            const inputResult = { content: `${getPrompt(directory)}${input}`, type: CommandResultType.INPUT };
            try {
                const result = await executeCommand(trimmedInput, fileSystem);
                if (fileSystem.cwd() !== directory) changeDirectory(fileSystem.cwd());
                setOutput(previous => [...previous, inputResult, ...result]);
            } catch (error) {
                setOutput(previous => [...previous, inputResult, { content: (error as Error).message, type: CommandResultType.ERROR }]);
            }
        });
    }, [input, fileSystem, addCommandToHistory, queueClear, executeCommand, changeDirectory, setOutput]);

    useKeyboardNavigation(inputRef, fileSystem, getPreviousCommand, getNextCommand, setInput, queueClear, handleSubmit);

    useEffect(() => {
        const controller = new AbortController();
        LinuxFileSystem.start(files, controller.signal).then(fs => {
            if (!controller.signal.aborted) {
                changeDirectory(fs.cwd());
                setFileSystem(fs);
            }
        }).catch(error => {
            if (!controller.signal.aborted) {
                console.error('Failed to initialize file system:', error);
                const content = error instanceof Error ? error.message : 'Failed to initialize file system. Please try again.';
                setOutput(previous => [...previous, { content, type: CommandResultType.ERROR }]);
            }
        });
        return () => controller.abort();
    }, [files, changeDirectory, setOutput]);

    useEffect(() => {
        const current = terminalRef.current;
        if (current) {
            current.scrollTop = current.scrollHeight;
        }
    }, [output]);

    return (
        <div ref={terminalRef} className={styles.terminal} onClick={() => inputRef.current?.focus()}>
            <Output outputs={output} />
            {fileSystem && <TerminalInput
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                prompt={getPrompt(currentDirectory)}
            />}
        </div>
    );
};

export default Terminal;
