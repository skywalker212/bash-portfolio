import { useState, useCallback } from 'react';

export const useCommandHistory = (initialHistory: string[] = []) => {
    const [history, setHistory] = useState<string[]>(initialHistory);
    const [historyIndex, setHistoryIndex] = useState<number>(history.length);

    const addToHistory = useCallback((command: string) => {
        setHistory(prev => [...prev, command]);
        setHistoryIndex(prev => prev + 1);
    }, []);

    const getPreviousCommand = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            return history[historyIndex - 1];
        }
        return null;
    }, [history, historyIndex]);

    const getNextCommand = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            return history[historyIndex + 1];
        }
        if (historyIndex === history.length - 1) {
            setHistoryIndex(history.length);
            return '';
        }
        return null;
    }, [history, historyIndex]);

    return { addToHistory, getPreviousCommand, getNextCommand };
};