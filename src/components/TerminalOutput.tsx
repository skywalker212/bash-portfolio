import React from 'react';
import { CommandResult, CommandResultType } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';
import { table, getBorderCharacters } from 'table';

const TerminalOutput: React.FC<CommandResult> = ({ content, type }: CommandResult) => {
    let outputClass = styles.output;

    switch (type) {
        case CommandResultType.ERROR:
            outputClass += ` ${styles.error}`;
            break;
        case CommandResultType.SUCCESS:
            outputClass += ` ${styles.success}`;
            break;
        case CommandResultType.INFO:
            outputClass += ` ${styles.info}`;
            break;
        case CommandResultType.INPUT:
            outputClass += ` ${styles.input}`;
            break;
    }

    if (type === CommandResultType.TABLE) {
        return (
            <div className={outputClass}>
                {table(content as string[][], {
                    border: getBorderCharacters('ramac')
                })}
            </div>
        );
    }

    if (type === CommandResultType.INPUT) {
        const [prompt, ...commandParts] = (content as string).split(' ');
        const command = commandParts.join(' ');
        return (
            <div className={outputClass}>
                <span className={styles.prompt}>{prompt}</span>
                <span>{command}</span>
            </div>
        );
    }

    if (type === CommandResultType.NONE) {
        return;
    }

    return <div className={outputClass}>{content}</div>;
};

export default TerminalOutput;