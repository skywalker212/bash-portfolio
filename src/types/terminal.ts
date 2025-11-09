import { TerminalStore } from "@/store";
import { WASMFileSystem } from "@/utils";
import { ArgumentParser } from "js-argparse";
import { ReactNode } from "react";
import { Alignment } from "table";

export enum TerminalOutputStream {
    STDOUT = 'stdout',
    FILE = 'file'
}

export interface FileOutputStream {
    name: string
}

export interface TerminalState {
    user: string;
    host: string;
    outputStream: TerminalOutputStream,
    streamInfo?: FileOutputStream,
    currentDirectory: string;
    commandHistory: string[];
    historyIndex: number;
    replMode: string | null;
    replData: unknown;
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
    columns?: {width: number, wrapWord?: boolean, alignment?: Alignment}[]
}

export interface Command<T extends Record<string, unknown> = Record<string, unknown>> {
    name: string;
    args: ArgumentParser,
    description: string,
    execute: (state: {terminalStore: TerminalStore, fileSystem: WASMFileSystem}, args: T) => Promise<CommandResult | CommandResult[]> | CommandResult | CommandResult[];
}