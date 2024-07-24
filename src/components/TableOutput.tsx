import React, { useContext } from 'react';
import { TableCommandResult, TableType, TerminalOutputStream } from '@/types';
import styles from '@/styles/TerminalOutput.module.css';
import { table, getBorderCharacters } from 'table';
import { getOutputStream } from '@/store/terminalStore';
import htmlInnerText from 'react-innertext';
import { FileSystemContext } from './Terminal';

const TableOutput: React.FC<TableCommandResult> = ({ content, tableType, columns }: TableCommandResult) => {
    const fileSystem = useContext(FileSystemContext);
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
    const output =  (
        <div className={styles.output}>
            {processTableOutput(tableOutput)}
        </div>
    );
    const { outputStream, streamInfo } = getOutputStream();
    if (outputStream === TerminalOutputStream.STDOUT) {
        return output;
    } else {
        const text = htmlInnerText(output);
        if (fileSystem && streamInfo) {
            fileSystem.writeFile(streamInfo.name, text);
        }
        return;
    }
};

export default TableOutput;