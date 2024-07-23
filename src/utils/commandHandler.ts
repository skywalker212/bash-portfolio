import { TerminalStore } from '@/store';
import { commands } from '../commands';
import { parseCommand } from './terminalUtils';
import { Command, CommandArgument, CommandArgumentTypeEnum, CommandResult, CommandResultType } from '@/types';
import { WASMFileSystem } from './fileSystemUtils';

class ArgError extends Error {}

export const generateUsageString = (command: Command): string => {
  const cmdArgs = command.args ? command.args : {};
  const requiredArgs = cmdArgs.required ? cmdArgs.required : [];
  const optionalArgs = cmdArgs.optional ? cmdArgs.optional : [];
  return `usage: ${command.name}${optionalArgs.length > 0 ? ` ${optionalArgs.map(arg => `[${arg.name}]`).join(" ")}` : ``} ${requiredArgs.map(arg => `${arg.name}`)}`
}

export const handleCommand = async (input: string, terminalStore: TerminalStore, fileSystem: WASMFileSystem): Promise<CommandResult[]> => {
  const { command: commandName, args } = parseCommand(input);

  const command = commands.find(cmd => cmd.name === commandName);

  if (command) {
    try {
      const allArgs = command.args ? command.args : {};
      const requiredArgs = allArgs.required ? allArgs.required : [];
      const optionalArgs = allArgs.optional ? allArgs.optional : [];
      if (requiredArgs.length > args.length || (optionalArgs.length + requiredArgs.length < args.length)) {
        // http://courses.cms.caltech.edu/cs11/material/general/usage.html
        throw new ArgError(generateUsageString(command));
      } else {
        const cmdArgs = args.length > requiredArgs.length ? [...optionalArgs, ...requiredArgs] : requiredArgs;
        const result = await command.execute({terminalStore, fileSystem}, ...args.map((arg, index) => {
          const cmdArg: CommandArgument = cmdArgs[index];
          switch (cmdArg.type) {
            case CommandArgumentTypeEnum.NUMBER:
              return parseInt(arg);
            case CommandArgumentTypeEnum.BOOLEAN:
              return Boolean(arg);
            case CommandArgumentTypeEnum.STRING:
              return arg;
          }
        }));
        return Array.isArray(result) ? result : [result];
      }
    } catch (error: unknown) {
      if (error instanceof ArgError) {
        return [{
          content: error.message,
          type: CommandResultType.TEXT
        }];
      } else {
        console.error(`Error executing command ${commandName}:`, error);
        return [{
          content: `Error executing command ${commandName}: ${(error as Error).message}`,
          type: CommandResultType.ERROR
        }];
      }
    }
  } else {
    return [{
      content: `Command not found: ${commandName}. Type 'help' for a list of available commands.`,
      type: CommandResultType.ERROR
    }];
  }
};