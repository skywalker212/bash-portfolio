export interface ParsedCommand {
    command: string;
    args: string[];
}

export interface TerminalStyle {
    backgroundColor: string;
    color: string;
}

export interface InputStyle extends TerminalStyle {
    caretColor: string;
}

export interface TypeWriterOptions {
    speed?: number;
    targetId?: string;
    onCharacterTyped?: (char: string, index: number) => void;
}

export interface BlinkCursorOptions {
    duration?: number;
    onBlink?: (isVisible: boolean) => void;
}

export interface ScrollToBottomOptions {
    smooth?: boolean;
    onComplete?: () => void;
}