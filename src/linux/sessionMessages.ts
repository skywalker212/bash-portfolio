export interface TerminalSize {
    cols: number;
    rows: number;
}

export type DuckDbDownload = 'loading' | 'ready' | 'failed';

export interface ZshPrompt {
    theme: string;
    format: string;
}

export type SessionRequest =
    | { type: 'start'; kernel: string; size: TerminalSize; prompt: ZshPrompt }
    | { type: 'zsh-prompt'; prompt: ZshPrompt }
    | { type: 'resize'; size: TerminalSize }
    | { type: 'stop' };

export type SessionEvent =
    | { type: 'ready'; input: WritableStream<string>; output: ReadableStream<Uint8Array>; temporary: boolean }
    | { type: 'duckdb-download'; state: DuckDbDownload }
    | { type: 'closed'; code: number | null; error?: string };
