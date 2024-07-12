import { commands } from '@/commands';
import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = (
    inputRef: React.RefObject<HTMLInputElement>,
    getPreviousCommand: () => string | null,
    getNextCommand: () => string | null,
    setInput: (value: string) => void,
    clearTerminal: () => void
) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                const prevCommand = getPreviousCommand();
                if (prevCommand !== null) {
                    setInput(prevCommand);
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                const nextCommand = getNextCommand();
                if (nextCommand !== null) {
                    setInput(nextCommand);
                }
                break;
            case 'Tab':
                event.preventDefault();
                const val = inputRef.current?.value;
                if (val) {
                    const matchingCommand = commands.find(command => command.name.startsWith(val))
                    if (matchingCommand) {
                        setInput(matchingCommand.name);
                    }
                }
            case 'l':
                if (event.ctrlKey) {
                    event.preventDefault();
                    clearTerminal();
                }
            default:
                break;
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