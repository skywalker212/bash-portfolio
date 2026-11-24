import { commands } from '@/commands';
import { parseCommand } from './terminalUtils';
import { CommandResultType, type CommandResult } from '@/types/terminal';
import type { TerminalFileSystem } from '@/types/fileSystem';
import { formatTable } from './formatTable';
import htmlInnerText from 'react-innertext';
import { ArgumentParserError, ArgumentTypeError, InvalidChoiceError, InvalidNargsError, MissingRequiredArgumentError, UnknownArgumentError } from 'js-argparse';

const argumentErrors = [
    [ArgumentTypeError, 'Invalid argument type'],
    [UnknownArgumentError, 'Unknown argument'],
    [MissingRequiredArgumentError, 'Missing required argument'],
    [InvalidChoiceError, 'Invalid choice'],
    [InvalidNargsError, 'Invalid number of arguments'],
    [ArgumentParserError, 'Argument parsing error'],
] as const;

function errorResult(content: string): CommandResult {
    return { type: CommandResultType.ERROR, content };
}

export async function handleCommand(input: string, fileSystem: TerminalFileSystem): Promise<CommandResult[]> {
    const { command, args, file } = parseCommand(input);
    const results = await executeCommand(command, args, fileSystem);
    if (!file) return results;

    const text = results.map(result => {
        if (result.type === CommandResultType.TABLE) return formatTable(result);
        if (result.type === CommandResultType.NONE) return '';
        return htmlInnerText(result.content);
    }).join('');

    try {
        await fileSystem.writeFile(file, text);
        return [];
    } catch (error) {
        return [errorResult((error as Error).message)];
    }
}

async function executeCommand(name: string, args: string, fileSystem: TerminalFileSystem): Promise<CommandResult[]> {
    const command = commands.find(entry => entry.name === name);
    if (!command) return [errorResult(`Command not found: ${name}. Type 'help' for a list of available commands.`)];

    try {
        const result = await command.run(fileSystem, args);
        return Array.isArray(result) ? result : [result];
    } catch (error) {
        const argumentError = argumentErrors.find(([Type]) => error instanceof Type);
        const prefix = argumentError?.[1] ?? `Error executing command ${name}`;
        const message = (error as Error).message;
        console.error(`${prefix}:`, message);
        const result = errorResult(`${prefix}: ${message}`);
        return argumentError ? [result, errorResult(command.usage(false))] : [result];
    }
}
