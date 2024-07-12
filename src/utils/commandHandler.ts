import { commands } from '../commands';
import { loadWasmModule } from './wasmLoader';
import { CommandResult, CommandResultType } from '@/types';

export const handleCommand = async (input: string): Promise<CommandResult> => {
  const [commandName, ...args] = input.trim().split(' ');

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
    // Try to load and execute a WASM module
    try {
      const wasmModule = await loadWasmModule(commandName);
      if (wasmModule) {
        // Execute the WASM module
        // This is a placeholder and would need to be implemented based on your WASM module structure
        return {
          content: `Executed WASM module: ${commandName}`,
          type: CommandResultType.OUTPUT
        };
      }
    } catch (error) {
      console.error('Failed to load WASM module:', error);
    }
  }

  return {
    content: `Command not found: ${commandName}. Type 'help' for a list of available commands.`,
    type: CommandResultType.ERROR
  };
};