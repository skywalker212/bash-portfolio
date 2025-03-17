import { parseCommand, WASMFileSystem } from '@/utils';
import { useEffect, useCallback } from 'react';

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const useKeyboardNavigation = (
    inputRef: React.RefObject<HTMLInputElement | null>,
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
                const inputValue = inputRef.current?.value;
                if (!inputValue) break;
                const { command, args, file } = parseCommand(inputValue);
                if (file || args) {
                    const fullPath = file || args.split(" ").pop() || "";
                    const path = fullPath.split("/");
                    const fileName = path.pop();
                    if (fileName) {
                        const dir = path.join("/") || ".";
                        try {
                            const matchingFileListing = fileSystem.getDetailedDirectoryListing(dir, true)
                                .find(listing => listing.name.toString().startsWith(fileName));
                            if (matchingFileListing) {
                                const newInput = inputValue.replace(
                                    new RegExp(`${escapeRegExp(fullPath)}$`),
                                    fullPath.replace(fileName, matchingFileListing.name.toString())
                                );
                                setInput(newInput);
                            }
                        } catch (error) {
                            console.error("Error listing directory:", error);
                        }
                    }
                } else if (command) {
                    const BIN_DIRECTORY = '/bin';
                    try {
                        const matchingCommandListing = fileSystem.getDetailedDirectoryListing(BIN_DIRECTORY, false)
                            .find(listing => listing.name.toString().startsWith(command));

                        if (matchingCommandListing) {
                            setInput(matchingCommandListing.name.toString());
                        }
                    } catch (error) {
                        console.error("Error listing bin directory:", error);
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