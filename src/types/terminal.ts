import type { ReactNode } from 'react';
import type { Alignment } from 'table';

export enum CommandResultType {
    INPUT = 'input',
    TEXT = 'text',
    ERROR = 'error',
    TABLE = 'table',
    CUSTOM = 'custom',
    NONE = 'none',
}

export enum TableType {
    NORMAL = 'normal',
    BORDERLESS = 'borderless',
}

export interface TableCommandResult {
    type: CommandResultType.TABLE;
    content: string[][];
    tableType?: TableType;
    columns?: { width: number; wrapWord?: boolean; alignment?: Alignment }[];
}

export type CommandResult =
    | TableCommandResult
    | { type: CommandResultType.INPUT | CommandResultType.TEXT | CommandResultType.ERROR; content: string }
    | { type: CommandResultType.CUSTOM; content: ReactNode }
    | { type: CommandResultType.NONE };
