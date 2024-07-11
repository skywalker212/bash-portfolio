import React, { useState, useEffect, useRef } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import TerminalInitialRender from './TerminalInitialRender';
import { useCommandHistory, useKeyboardNavigation, useTerminal, useAutoFocus, useInitialRender } from '@/hooks';
import styles from '@/styles/Terminal.module.css';
import { terminalConfig } from '@/config/terminalConfig';

const Terminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [currentDirectory, setCurrentDirectory] = useState(terminalConfig.initialDirectory);
    const { addToHistory, getPreviousCommand, getNextCommand } = useCommandHistory();
    const initialRender = useInitialRender();
    const { output, setOutput, executeCommand, clearTerminal } = useTerminal();
    const inputRef = useAutoFocus();
    const terminalRef = useRef<HTMLDivElement>(null);

    useKeyboardNavigation(inputRef, getPreviousCommand, getNextCommand, setInput);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        addToHistory(input);
        const prompt = `${terminalConfig.user}@${terminalConfig.host}:${currentDirectory}$`;
        const inputResult = { content: `${prompt} ${input}`, type: 'input' as const };
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
    }, [output, initialRender]);

    return (
        <div ref={terminalRef} className={styles.terminal}>
            <TerminalInitialRender initialRender={initialRender} />
            {output.map((item, index) => (
                <TerminalOutput key={index} content={item.content} type={item.type} />
            ))}
            <TerminalInput
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleSubmit}
                prompt={`${terminalConfig.user}@${terminalConfig.host}:${currentDirectory}$`}
            />
        </div>
    );
};

export default Terminal;