import React, { useState, useEffect, useRef } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { useCommandHistory, useKeyboardNavigation, useTerminal, useAutoFocus } from '@/hooks';

const Terminal: React.FC = () => {
    const [input, setInput] = useState('');
    const { addToHistory, getPreviousCommand, getNextCommand } = useCommandHistory();
    const { output, setOutput, executeCommand, clearTerminal } = useTerminal([{ content: 'Welcome to Akash Gajjar\'s terminal portfolio. Type "help" for available commands.', type: 'text' }]);
    const inputRef = useAutoFocus();
    const terminalRef = useRef<HTMLDivElement>(null);

    useKeyboardNavigation(inputRef, getPreviousCommand, getNextCommand, setInput);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        addToHistory(input);
        const inputResult = { content: input, type: 'input' as const };
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
    }, [output]);

    return (
        <div ref={terminalRef} className="terminal w-full h-screen overflow-y-auto bg-black text-green-500 font-mono p-2 sm:p-4">
            {output.map((item, index) => (
                <TerminalOutput key={index} content={item.content} type={item.type} />
            ))}
            <TerminalInput
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleSubmit}
                className="terminal-input"
            />
        </div>
    );
};

export default Terminal;