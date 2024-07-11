export interface CommandHistory {
    command: string;
    output: string;
}

export interface TerminalState {
    commandHistory: CommandHistory[];
    currentDirectory: string;
}

export type CommandHandler = (command: string) => string;

export type CommandResultType = 'input' | 'output' | 'error' | 'success' | 'info' | 'table' | 'custom';

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