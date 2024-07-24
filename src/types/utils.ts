export interface ParsedCommand {
    command: string;
    args: string[];
    file: string;
}

export interface TerminalStyle {
    backgroundColor: string;
    color: string;
}

export interface InputStyle extends TerminalStyle {
    caretColor: string;
}