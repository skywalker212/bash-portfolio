import { ChangeEvent, ReactNode } from 'react';

export interface TerminalProps {
    initialMessage?: string;
}

export interface TerminalInputProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    prompt: string;
}

export interface LayoutProps {
    children: ReactNode;
}