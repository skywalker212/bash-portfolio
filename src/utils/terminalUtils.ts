import { ParsedCommand } from '@/types';

export const getPrompt = (currentDirectory: string): string => {
  return `guest@akash-portfolio:${currentDirectory}$ `;
};

export const parseCommand = (input: string): ParsedCommand => {
  const parts = input.trim().split(' ');
  return {
    command: parts[0],
    args: parts.slice(1),
  };
};

export const formatOutput = (output: string): string => {
  return output.trim().replace(/\n/g, '<br>');
};