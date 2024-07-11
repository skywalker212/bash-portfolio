import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = (
    inputRef: React.RefObject<HTMLInputElement>,
    getPreviousCommand: () => string | null,
    getNextCommand: () => string | null,
    setInput: (value: string) => void
) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevCommand = getPreviousCommand();
            if (prevCommand !== null) {
                setInput(prevCommand);
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextCommand = getNextCommand();
            if (nextCommand !== null) {
                setInput(nextCommand);
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            // Implement command auto-completion here if desired
        }
    }, [getPreviousCommand, getNextCommand, setInput]);

    useEffect(() => {
        const currentInputRef = inputRef.current;
        if (currentInputRef) {
            currentInputRef.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (currentInputRef) {
                currentInputRef.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [inputRef, handleKeyDown]);
};