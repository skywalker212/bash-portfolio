import React, { useState, useEffect, useRef, useCallback } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { useKeyboardNavigation, useTerminal, useAutoFocus } from '@/hooks';
import styles from '@/styles/Terminal.module.css';
import { CommandResultType } from '@/types';
import { getPrompt, WASMFileSystem } from '@/utils';
import { useTerminalStore, getPreviousCommand, getNextCommand } from '@/store';
import { initialRender } from '@/config';

const Terminal: React.FC = () => {
    const [input, setInput] = useState('');
    const terminalStore = useTerminalStore();
    const { currentDirectory, addCommandToHistory } = terminalStore;
    const { output, setOutput, executeCommand, clearTerminal } = useTerminal(initialRender, terminalStore);
    const inputRef = useAutoFocus();
    const terminalRef = useRef<HTMLDivElement>(null);
    const [fileSystem, setFileSystem] = useState<WASMFileSystem | null>(null);
    const [fileSystemInitialized, setFileSystemInitialized] = useState<boolean>(false);

    const handleSubmit = useCallback(async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        addCommandToHistory(trimmedInput);
        if (trimmedInput === 'clear') {
            clearTerminal();
        } else if (fileSystem) {
            const result = await executeCommand(trimmedInput, fileSystem);
            const inputResult = { content: `${getPrompt(currentDirectory)}${input}`, type: CommandResultType.INPUT };
            setOutput(prev => [...prev, inputResult, ...result]);
        }
        setInput('');
    }, [input, currentDirectory, fileSystem, addCommandToHistory, clearTerminal, executeCommand, setOutput]);

    useKeyboardNavigation(inputRef, getPreviousCommand, getNextCommand, setInput, clearTerminal, handleSubmit);

    useEffect(() => {

        const initFileSystem = async () => {
            try {
                const fs = await WASMFileSystem.initFsModule(terminalStore);
                setFileSystem(fs);
                setFileSystemInitialized(true);
            } catch (error) {
                console.error('Failed to initialize file system:', error);
                setOutput(prev => [...prev, { content: 'Failed to initialize file system. Please try again.', type: CommandResultType.ERROR }]);
            }
        };

        if (!fileSystemInitialized) {
            initFileSystem();
        }

        const current = terminalRef.current;
        const handleTerminalClick = () => {
            inputRef.current?.focus();
        };

        current?.addEventListener('click', handleTerminalClick);

        return () => {
            current?.removeEventListener('click', handleTerminalClick);
        };
    }, [terminalStore, inputRef, fileSystemInitialized, setOutput]);

    useEffect(() => {
        const current = terminalRef.current;
        if (current) {
            current.scrollTop = current.scrollHeight;
        }
    }, [output]);

    return (
        <div ref={terminalRef} className={styles.terminal}>
            {output.map((item, index) => (
                <TerminalOutput key={index} content={item.content} type={item.type} />
            ))}
            <TerminalInput
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                prompt={getPrompt(currentDirectory)}
            />
        </div>
    );
};

export default Terminal;