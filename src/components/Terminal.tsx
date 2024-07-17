import React, { useState, useEffect, useRef } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { useKeyboardNavigation, useTerminal, useAutoFocus } from '@/hooks';
import styles from '@/styles/Terminal.module.css';
import { CommandResultType } from '@/types';
import { getPrompt } from '@/utils';
import { useTerminalStore, getPreviousCommand, getNextCommand } from '@/store';
import { initialRender } from '@/config';

const Terminal: React.FC = () => {
    const [input, setInput] = useState('');
    const terminalStore = useTerminalStore();
    const { currentDirectory, addCommandToHistory } = terminalStore;
    const { output, setOutput, executeCommand, clearTerminal } = useTerminal(initialRender, terminalStore);
    const inputRef = useAutoFocus();
    const terminalRef = useRef<HTMLDivElement>(null);

    useKeyboardNavigation(inputRef, getPreviousCommand, getNextCommand, setInput, clearTerminal);

    const handleSubmit = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        addCommandToHistory(trimmedInput);
        if (trimmedInput == 'clear') {
            clearTerminal();
        } else {
            const result = await executeCommand(trimmedInput);
            const inputResult = { content: `${getPrompt(currentDirectory)}${input}`, type: CommandResultType.INPUT };
            setOutput(prev => [...prev, inputResult, ...result]);
        }
        setInput('');
    };

    useEffect(() => {
        const current = terminalRef.current;
        if (current) {
            current.scrollTop = current.scrollHeight;
        }
        const handleTerminalClick = () => {
            inputRef.current?.focus();
        };

        current?.addEventListener('click', handleTerminalClick);

        return () => {
            current?.removeEventListener('click', handleTerminalClick);
        };
    }, [output, inputRef]);

    return (
        <div ref={terminalRef} className={styles.terminal}>
            {output.map((item, index) => (
                <TerminalOutput key={index} content={item.content} type={item.type} />
            ))}
            <TerminalInput
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleSubmit}
                prompt={getPrompt(currentDirectory)}
            />
        </div>
    );
};

export default Terminal;