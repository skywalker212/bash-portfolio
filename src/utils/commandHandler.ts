import { TerminalStore } from '@/store';
import { commands } from '../commands';
import { parseCommand } from './terminalUtils';
import { CommandResult, CommandResultType, ParsedCommand, TableCommandResult } from '@/types';
import { LinuxFileSystem } from './fileSystemUtils';
import { formatTable } from './formatTable';
import htmlInnerText from 'react-innertext';
import { ArgumentParserError, ArgumentTypeError, InvalidChoiceError, InvalidNargsError, MissingRequiredArgumentError, UnknownArgumentError } from 'js-argparse';

export const handleCommand = async (input: string, terminalStore: TerminalStore, fileSystem: LinuxFileSystem): Promise<CommandResult[]> => {
  const parsed = parseCommand(input);
  const results = await executeCommand(parsed, terminalStore, fileSystem);
  if (!parsed.file) return results;

  const text = results.map(result => result.type === CommandResultType.TABLE
    ? formatTable(result as TableCommandResult)
    : htmlInnerText(result.content)
  ).join('');

  try {
    await fileSystem.writeFile(parsed.file, text);
    return [];
  } catch (error) {
    return [{ content: (error as Error).message, type: CommandResultType.ERROR }];
  }
};

const executeCommand = async (
  { command: commandName, args }: ParsedCommand,
  terminalStore: TerminalStore,
  fileSystem: LinuxFileSystem,
): Promise<CommandResult[]> => {
  const command = commands.find(cmd => cmd.name === commandName);

  if (command) {
    try {
      const parsedArgs = command.args.parseArgs(args);
      const result = await command.execute({ terminalStore, fileSystem }, parsedArgs);
      return Array.isArray(result) ? result : [result];
    } catch (error: unknown) {
      const result: CommandResult[] = []
      if (error instanceof ArgumentTypeError) {
        console.error('Invalid argument type:', error.message);
        result.push({
          content: `Invalid argument type: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        });
      } else if (error instanceof UnknownArgumentError) {
        console.error('Unknown argument:', error.message);
        result.push({
          content: `Unknown argument: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        });
      } else if (error instanceof MissingRequiredArgumentError) {
        console.error('Missing required argument:', error.message);
        result.push({
          content: `Missing required argument: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        });
      } else if (error instanceof InvalidChoiceError) {
        console.error('Invalid choice:', error.message);
        result.push({
          content: `Invalid choice: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        });
      } else if (error instanceof InvalidNargsError) {
        console.error('Invalid number of arguments:', error.message);
        result.push({
          content: `Invalid number of arguments: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        });
      } else if (error instanceof ArgumentParserError) {
        console.error('Argument parsing error:', error.message);
        result.push({
          content: `Argument parsing error: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        });
      } else {
        console.error(`Error executing command ${commandName}:`, error);
        return [{
          content: `Error executing command ${commandName}: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        }];
      }
      result.push({
        content: command.args.usage(false),
        type: CommandResultType.ERROR
      });
      return result;
    }
  } else {
    return [{
      content: `Command not found: ${commandName}. Type 'help' for a list of available commands.`,
      type: CommandResultType.ERROR
    }];
  }
};