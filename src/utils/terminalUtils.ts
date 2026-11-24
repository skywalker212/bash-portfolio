import { HOME_DIR, terminalConfig } from '@/config/terminalConfig';
import type { TerminalFileSystem } from '@/types/fileSystem';

export function getPrompt(currentDirectory: string): string {
  const path = currentDirectory.startsWith(HOME_DIR) ? '~' + currentDirectory.slice(HOME_DIR.length) : currentDirectory;
  return `${terminalConfig.user}@${terminalConfig.host}:${path}$ `;
}

export function parseCommand(input: string) {
  const [command, file] = input.split('>');
  const parts = command.trim().split(' ');
  return {
    command: parts[0],
    args: parts.slice(1).join(' '),
    file: file ? file.trim() : '',
  };
}

export async function completeInput(input: string, fileSystem: Pick<TerminalFileSystem, 'getDetailedDirectoryListing'>) {
  const { command, args, file } = parseCommand(input);
  const isPath = Boolean(args || file);
  if (!isPath && !command) return input;

  try {
    if (!isPath) {
      const entries = await fileSystem.getDetailedDirectoryListing('/bin', false);
      return entries.find(entry => entry.name.startsWith(command))?.name ?? input;
    }

    const path = file || args.split(' ').pop() || '';
    const parts = path.split('/');
    const name = parts.pop();
    if (!name || !input.endsWith(path)) return input;

    const entries = await fileSystem.getDetailedDirectoryListing(parts.join('/') || '.', true);
    const match = entries.find(entry => entry.name.startsWith(name));
    return match ? input.slice(0, -path.length) + path.replace(name, match.name) : input;
  } catch (error) {
    console.error(isPath ? 'Error listing directory:' : 'Error listing bin directory:', error);
    return input;
  }
}
