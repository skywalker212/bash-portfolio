import { useEffect, useRef, useState } from 'react';
import { commandHelpFiles } from '@/commands';
import { clearCommand } from '@/commands/clear';
import { HOME_DIR, initialRender } from '@/config/terminalConfig';
import type { TerminalFileSystem } from '@/types/fileSystem';
import { CommandResultType, type CommandResult } from '@/types/terminal';
import { handleCommand } from '@/utils/commandHandler';
import { LinuxFileSystem, type PortfolioFiles } from '@/utils/fileSystemUtils';
import { completeInput, getPrompt } from '@/utils/terminalUtils';

interface Session {
    files: PortfolioFiles;
    fileSystem: TerminalFileSystem;
    directory: string;
    signal: AbortSignal;
}

export function useTerminal(files: PortfolioFiles) {
    const [output, setOutput] = useState(initialRender);
    const [session, setSession] = useState<Session | null>(null);
    const pending = useRef(Promise.resolve());
    const history = useRef<{ commands: string[]; index: number }>({ commands: [], index: 0 });
    const activeSession = session?.files === files ? session : null;

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        LinuxFileSystem.start({ ...files, help: commandHelpFiles }, HOME_DIR, signal).then(fileSystem => {
            if (!signal.aborted) setSession({ files, fileSystem, directory: fileSystem.cwd(), signal });
        }).catch(error => {
            if (signal.aborted) return;
            console.error('Failed to initialize file system:', error);
            const content = error instanceof Error ? error.message : 'Failed to initialize file system. Please try again.';
            setOutput(previous => [...previous, { content, type: CommandResultType.ERROR }]);
        });
        return () => controller.abort();
    }, [files]);

    function enqueue(action: (session: Session) => void | Promise<void>) {
        if (!activeSession) return;
        pending.current = pending.current.then(() => {
            if (!activeSession.signal.aborted) return action(activeSession);
        });
    }

    function clear() {
        enqueue(() => setOutput([]));
    }

    function submit(input: string) {
        const command = input.trim();
        if (!command || !activeSession) return false;

        history.current.commands.push(command);
        history.current.index = history.current.commands.length;

        if (command === clearCommand.name) {
            clear();
            return true;
        }

        enqueue(async ({ fileSystem, signal }) => {
            const echo: CommandResult = { type: CommandResultType.INPUT, content: getPrompt(fileSystem.cwd()) + input };
            let results: CommandResult[];
            try {
                results = await handleCommand(command, fileSystem);
            } catch (error) {
                results = [{ type: CommandResultType.ERROR, content: (error as Error).message }];
            }
            if (signal.aborted) return;

            const directory = fileSystem.cwd();
            setSession(current => current?.signal === signal && current.directory !== directory
                ? { ...current, directory }
                : current);
            setOutput(previous => [...previous, echo, ...results]);
        });
        return true;
    }

    function recall(direction: -1 | 1) {
        const { commands, index } = history.current;
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex > commands.length) return null;

        history.current.index = nextIndex;
        return commands[nextIndex] ?? '';
    }

    async function complete(input: string) {
        if (!activeSession) return input;
        await pending.current;
        if (activeSession.signal.aborted) return input;
        return completeInput(input, activeSession.fileSystem);
    }

    return {
        output,
        prompt: activeSession ? getPrompt(activeSession.directory) : null,
        submit,
        clear,
        recall,
        complete,
    };
}
