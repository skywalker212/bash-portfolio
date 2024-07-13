export * from './commandHandler';
export * from './terminalUtils';
export * from './styleUtils';
export * from './wasmLoader';

export const kebabCase = (string: string) => string
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export const titleCase = (string: string) => string
    .replace(/\w\S*/g, (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
