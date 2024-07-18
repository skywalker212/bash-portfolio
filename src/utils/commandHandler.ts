import { TerminalStore } from '@/store';
import { commands } from '../commands';
import { parseCommand } from './terminalUtils';
import { CommandArgument, CommandArgumentTypeEnum, CommandResult, CommandResultType } from '@/types';
import { WASMFileSystem } from './fileSystemUtils';

export const handleCommand = async (input: string, terminalStore: TerminalStore, fileSystem: WASMFileSystem): Promise<CommandResult[]> => {
  const { command: commandName, args } = parseCommand(input);

  const command = commands.find(cmd => cmd.name === commandName);

  if (command) {
    try {
      const cmdArgs = command.args ? command.args : [];
      const requiredArgs = cmdArgs.reduce((val, curr) => val + (curr.optional ? 0 : 1), 0);
      if (requiredArgs > args.length) {
        throw Error(`Required number of arguments: ${requiredArgs}, Provided: ${args.length}`);
      } else if (cmdArgs.length < args.length) {
        throw Error(`Provided too many arguments. Possible arguments: ${cmdArgs.length}, Provided: ${args.length}`);
      } else {
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
      console.error(`Error executing command ${commandName}:`, error);
      return [{
        content: `Error executing command ${commandName}: ${(error as Error).message}`,
        type: CommandResultType.ERROR
      }];
    }
  } else {
    return [{
      content: `Command not found: ${commandName}. Type 'help' for a list of available commands.`,
      type: CommandResultType.ERROR
    }];
  }
};