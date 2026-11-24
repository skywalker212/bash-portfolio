'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import TerminalInput from './TerminalInput';
import Output from './Output';
import { useTerminal } from '@/hooks/useTerminal';
import styles from '@/styles/Terminal.module.css';
import type { PortfolioFiles } from '@/utils/fileSystemUtils';

export default function Terminal({ files }: { files: PortfolioFiles }) {
    const { output, prompt, submit, clear, recall, complete } = useTerminal(files);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                if (submit(input)) setInput('');
                break;
            case 'ArrowUp':
            case 'ArrowDown': {
                event.preventDefault();
                const previous = recall(event.key === 'ArrowUp' ? -1 : 1);
                if (previous !== null) setInput(previous);
                break;
            }
            case 'Tab': {
                event.preventDefault();
                const element = event.currentTarget;
                const value = element.value;
                const suggestion = await complete(value);
                if (inputRef.current === element && element.value === value) setInput(suggestion);
                break;
            }
            case 'l':
                if (event.ctrlKey) {
                    event.preventDefault();
                    clear();
                }
                break;
        }
    }

    useEffect(() => {
        const terminal = terminalRef.current;
        if (terminal) terminal.scrollTop = terminal.scrollHeight;
    }, [output]);

    return (
        <div ref={terminalRef} className={styles.terminal} onClick={() => inputRef.current?.focus()}>
            <Output outputs={output} />
            {prompt !== null && <TerminalInput
                ref={inputRef}
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                prompt={prompt}
            />}
        </div>
    );
}
