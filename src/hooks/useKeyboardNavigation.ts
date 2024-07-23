import { WASMFileSystem } from '@/utils';
import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = (
    inputRef: React.RefObject<HTMLInputElement>,
    fileSystem: WASMFileSystem,
    getPreviousCommand: () => string | null,
    getNextCommand: () => string | null,
    setInput: (value: string) => void,
    clearTerminal: () => void,
    handleSubmit: () => void
) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'Enter': {
                event.preventDefault();
                handleSubmit();
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                const prevCommand = getPreviousCommand();
                if (prevCommand !== null) {
                    setInput(prevCommand);
                }
                break;
            }
            case 'ArrowDown': {
                event.preventDefault();
                const nextCommand = getNextCommand();
                if (nextCommand !== null) {
                    setInput(nextCommand);
                }
                break;
            }
            case 'Tab': {
                event.preventDefault();
                const val = inputRef.current?.value;
                if (val) {
                    const matchingCommand = fileSystem.listDirectory('/bin').find(name => name.startsWith(val))
                    if (matchingCommand) {
                        setInput(matchingCommand);
                    }
                }
                break;
            }
            case 'l': {
                if (event.ctrlKey) {
                    event.preventDefault();
                    clearTerminal();
                }
                break;
            }
            default:
                break;
        }
    }, [inputRef, fileSystem, handleSubmit, getPreviousCommand, setInput, getNextCommand, clearTerminal]);

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