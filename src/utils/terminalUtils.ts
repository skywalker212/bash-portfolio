import { ParsedCommand } from '@/types';
import { terminalConfig } from '@/config';
import { HOME_DIR } from '@/config/terminalConfig';

export const getPrompt = (currentDirectory: string): string => {
  const homeDirectoryRegex = new RegExp(`^${HOME_DIR}`);
  return `${terminalConfig.user}@${terminalConfig.host}:${currentDirectory.replace(homeDirectoryRegex,'~')}$ `;
};

export const parseCommand = (input: string): ParsedCommand => {
  const parts = input.split(' ');
  return {
    command: parts[0],
    args: parts.slice(1),
  };
};