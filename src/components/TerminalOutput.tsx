import React from 'react';
import { CommandResult } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';
import { table, getBorderCharacters } from 'table';

const TerminalOutput: React.FC<CommandResult> = ({ content, type }: CommandResult) => {
    let outputClass = styles.output;

    switch (type) {
        case 'error':
            outputClass += ` ${styles.error}`;
            break;
        case 'success':
            outputClass += ` ${styles.success}`;
            break;
        case 'info':
            outputClass += ` ${styles.info}`;
            break;
        case 'input':
            outputClass += ` ${styles.input}`;
            break;
    }

    if (type === 'table') {
        return (
            <div className={outputClass}>
                {table(content, {
                    border: getBorderCharacters('ramac')
                })}
            </div>
        );
    }

    if (type === 'input') {
        const [prompt, ...commandParts] = content.split(' ');
        const command = commandParts.join(' ');
        return (
            <div className={outputClass}>
                <span className={styles.prompt}>{prompt}</span>
                <span>{command}</span>
            </div>
        );
    }

    return <div className={outputClass}>{content}</div>;
};

export default TerminalOutput;