import { ReactNode } from 'react';

export interface TerminalProps {
    initialMessage?: string;
}

export interface TerminalInputProps {
    onSubmit: (command: string) => void;
    prompt: string;
}

export interface TerminalOutputProps {
    output: string;
}

export interface LayoutProps {
    children: ReactNode;
}