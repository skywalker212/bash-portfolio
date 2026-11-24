import { TableCommandResult, TableType } from '@/types';
import { table, getBorderCharacters } from 'table';

export function formatTable({ content, tableType, columns }: TableCommandResult) {
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
    return table(content as string[][], tableConfig);
}
