export * from './commandHandler';
export * from './terminalUtils';
export * from './styleUtils';
export * from './fileSystemUtils';

export const kebabCase = (string: string) => string
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
