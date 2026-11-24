import React from 'react';
import { CommandResult, CommandResultType } from '@/types';
import styles from '@/styles/Output.module.css';
import { injectLinkToText } from './Output';

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

    let output;
    if (type === CommandResultType.INPUT) {
        const [prompt, ...commandParts] = (content as string).split(' ');
        const command = commandParts.join(' ');
        output = (
            <div className={outputClass}>
                <span className={styles.prompt}>{prompt}</span>
                <span>{command}</span>
            </div>
        );
    } else if (type === CommandResultType.NONE) {
        output = null;
    } else {
        output = <div className={outputClass}>{type === CommandResultType.TEXT ? injectLinkToText(content as string) : content}</div>;
    }

    return output;
};

export default TerminalOutput;
