export interface CommandHistory {
    command: string;
    output: string;
}

export interface TerminalState {
    commandHistory: CommandHistory[];
    currentDirectory: string;
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
    content: any;
    type: CommandResultType;
}

export interface Command {
    name: string;
    description: string;
    execute: (args: string[]) => Promise<CommandResult> | CommandResult;
}

export interface WasmModule {
    name: string;
    module: WebAssembly.Module;
}