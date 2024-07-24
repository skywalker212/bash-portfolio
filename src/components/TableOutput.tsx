import React from 'react';
import { TableCommandResult, TableType } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';
import { table, getBorderCharacters } from 'table';

const TableOutput: React.FC<TableCommandResult> = ( { content, tableType, columns }: TableCommandResult) => {
    let tableConfig = null;
    switch (tableType) {
        case TableType.NORMAL:
            tableConfig = {
                border: getBorderCharacters('ramac'),
                columnDefault: {
                    paddingLeft: 1,
                    paddingRight: 1,
                },
                columns: columns,
            }
            break;
        case TableType.BORDERLESS:
            tableConfig = {
                border: getBorderCharacters('void'),
                columnDefault: {
                    paddingLeft: 0,
                    paddingRight: 1,
                },
                drawHorizontalLine: () => false,
                columns: columns,
            }
            break;
        case TableType.TEXT:
            tableConfig = {
                border: getBorderCharacters('void'),
                columnDefault: {
                    paddingLeft: 0,
                },
                drawHorizontalLine: () => false,
                columns: columns
            }
            break;
        default:
            tableConfig = {
                border: getBorderCharacters('ramac'),
                columns: columns
            }
            break;
    }
    const processTableOutput = (tableOutput: string) => {
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const parts = tableOutput.split(linkRegex);

        return parts.map((part, index) => {
            if (part.match(linkRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        className={styles.terminalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };
    const tableOutput = table(content as string[][], tableConfig);
    return (
        <div className={styles.output}>
            {processTableOutput(tableOutput)}
        </div>
    );
};

export default TableOutput;