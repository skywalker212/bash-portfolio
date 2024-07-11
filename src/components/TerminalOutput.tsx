import React from 'react';
import { CommandResult } from '@/types';

const TerminalOutput: React.FC<CommandResult> = ({ content, type }) => {
    if (type === 'input') {
        return <div className="mb-1">$ {content}</div>;
    }

    if (type === 'text') {
        return <div className="mb-1 whitespace-pre-wrap">{content}</div>;
    }

    if (type === 'table') {
        return (
            <div className="mb-1">
                <table className="w-full">
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

    if (type === 'custom') {
        return <div className="mb-1">{content}</div>;
    }

    return null;
};

export default TerminalOutput;