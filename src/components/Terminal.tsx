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
    const { currentDirectory, addCommandToHistory, changeDirectory } = useTerminalStore();
    const { output, setOutput, executeCommand, clearTerminal } = useTerminal(initialRender);
    const inputRef = useAutoFocus();
    const terminalRef = useRef<HTMLDivElement>(null);

    useKeyboardNavigation(inputRef, getPreviousCommand, getNextCommand, setInput, clearTerminal);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        addCommandToHistory(input);
        const inputResult = { content: `${getPrompt(currentDirectory)}${input}`, type: CommandResultType.INPUT };
        const result = await executeCommand(input);
        if (result.content === 'CLEAR_TERMINAL') {
            clearTerminal();
        } else {
            setOutput(prev => [...prev, inputResult, result]);
        }
        setInput('');
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        const handleTerminalClick = () => {
            inputRef.current?.focus();
        };

        terminalRef.current?.addEventListener('click', handleTerminalClick);

        return () => {
            terminalRef.current?.removeEventListener('click', handleTerminalClick);
        };
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
                onSubmit={handleSubmit}
                prompt={getPrompt(currentDirectory)}
            />
        </div>
    );
};

export default Terminal;