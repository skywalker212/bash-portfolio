import React from 'react';
import { CommandResult } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';

const TerminalOutput: React.FC<CommandResult> = ({ content, type }) => {
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
        // Add more cases if needed
    }

    if (type === 'table') {
        return (
            <div className={outputClass}>
                <table>
                    <tbody>
                        {(content as string[][]).map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j} className="pr-4">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <div className={outputClass}>{content}</div>;
};

export default TerminalOutput;