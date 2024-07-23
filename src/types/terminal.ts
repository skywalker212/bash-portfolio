import { TerminalStore } from "@/store";
import { WASMFileSystem } from "@/utils";
import { ReactNode } from "react";

export interface TerminalState {
    user: string;
    host: string;
    currentDirectory: string;
    commandHistory: string[];
    historyIndex: number;
}

export type CommandHandler = (command: string) => string;

export enum CommandResultType {
    INPUT = 'input',
    TEXT = 'text',
    ERROR = 'error',
    SUCCESS = 'success',
    INFO = 'info',
    TABLE = 'table',
    CUSTOM = 'custom',
    NONE = 'none'
}

export interface CommandResult {
    content?: string[][] | ReactNode;
    type: CommandResultType;
}

export enum TableType {
    NORMAL = 'normal',
    BORDERLESS = 'borderless',
    TEXT = 'text'
}

export interface TableCommandResult extends CommandResult {
    type: CommandResultType.TABLE,
    tableType: TableType,
    columns?: {width: number}[]
}

export enum CommandArgumentTypeEnum {
    NUMBER = 'number',
    STRING = 'string',
    BOOLEAN = 'boolean'
}

export type CommandArgumentType = string | number | boolean;

export interface CommandArgument {
    name: string,
    type: CommandArgumentTypeEnum,
    default?: CommandArgumentType
}

export interface Command<T extends CommandArgumentType[] = CommandArgumentType[]> {
    name: string;
    description: string;
    args?: {
        optional?: CommandArgument[],
        required?: CommandArgument[]
    },
    execute: (state: {terminalStore: TerminalStore, fileSystem: WASMFileSystem}, ...args: T) => Promise<CommandResult | CommandResult[]> | CommandResult | CommandResult[];
}