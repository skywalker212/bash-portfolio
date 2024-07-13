import { ParsedCommand } from '@/types';
import { terminalConfig } from '@/config';

export const getPrompt = (currentDirectory: string): string => {
  return `${terminalConfig.user}@${terminalConfig.host}:${currentDirectory}$ `;
};

export const parseCommand = (input: string): ParsedCommand => {
  const parts = input.split(' ');
  return {
    command: parts[0],
    args: parts.slice(1),
  };
};