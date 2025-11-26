import { ParsedCommand } from '@/types';
import { terminalConfig } from '@/config';
import { HOME_DIR } from '@/config/terminalConfig';

export const getPrompt = (currentDirectory: string, replMode?: string | null): string => {
  const homeDirectoryRegex = new RegExp(`^${HOME_DIR}`);
  const basePrompt = `${terminalConfig.user}@${terminalConfig.host}:${currentDirectory.replace(homeDirectoryRegex, '~')}`;
  return replMode ? `${replMode}> ` : `${basePrompt}$ `;
};

export const parseCommand = (input: string): ParsedCommand => {
  const [command, file] = input.split('>')
  const parts = command.trim().split(' ');
  return {
    command: parts[0],
    args: parts.slice(1).join(' '),
    file: file ? file.trim() : ''
  };
};