import { commands } from '../commands';
import { parseCommand } from './terminalUtils';
import { CommandResult, CommandResultType } from '@/types';

export const handleCommand = async (input: string): Promise<CommandResult> => {
  const { command: commandName, args } = parseCommand(input);

  const command = commands.find(cmd => cmd.name === commandName);

  if (command) {
    try {
      return await command.execute(args);
    } catch (error: any) {
      console.error(`Error executing command ${commandName}:`, error);
      return {
        content: `Error executing command ${commandName}: ${error.message}`,
        type: CommandResultType.ERROR
      };
    }
  } else {
    return {
      content: `Command not found: ${commandName}. Type 'help' for a list of available commands.`,
      type: CommandResultType.ERROR
    };
  }
};