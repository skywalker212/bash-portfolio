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
                    paddingLeft: 0,
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
    return (
        <div className={styles.output}>
            {table(content as string[][], tableConfig)}
        </div>
    );
};

export default TableOutput;