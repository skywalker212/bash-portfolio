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
    OUTPUT = 'output',
    ERROR = 'error',
    SUCCESS = 'success',
    INFO = 'info',
    TABLE = 'table',
    CUSTOM = 'custom'
}

export interface CommandResult {
    content: string[][] | ReactNode;
    type: CommandResultType;
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
    optional?: boolean
}

export interface Command<T extends CommandArgumentType[] = CommandArgumentType[]> {
    name: string;
    description: string;
    args?: CommandArgument[]
    execute: (...args: T) => Promise<CommandResult> | CommandResult;
}

export interface WasmModule {
    name: string;
    instance: WebAssembly.WebAssemblyInstantiatedSource;
}