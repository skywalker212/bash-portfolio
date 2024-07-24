import React, { useContext } from 'react';
import { CommandResult, CommandResultType, TerminalOutputStream } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';
import { getOutputStream } from '@/store/terminalStore';
import htmlInnerText from 'react-innertext';
import { FileSystemContext } from './Terminal';

const TerminalOutput: React.FC<CommandResult> = ({ content, type }: CommandResult) => {
    const fileSystem = useContext(FileSystemContext);
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
        output = <div className={outputClass}>{content}</div>;
    }

    const { outputStream, streamInfo } = getOutputStream();
    if (type !== CommandResultType.INPUT && outputStream === TerminalOutputStream.FILE) {
        const text = htmlInnerText(output);
        if (fileSystem && streamInfo) {
            fileSystem.writeFile(streamInfo.name, text);
        }
        return;
    } else {
        return output;
    }

};

export default TerminalOutput;