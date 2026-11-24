export interface FileInfo {
    permissions: string;
    linkCount: number;
    owner: string;
    group: string;
    size: number;
    modTime: string;
    name: string;
    isDirectory: boolean;
    isSymlink: boolean;
    linkTarget: string;
}

export interface TerminalFileSystem {
    cwd(): string;
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    getDetailedDirectoryListing(path: string, showHidden: boolean): Promise<FileInfo[]>;
    makeDirectory(path: string): Promise<void>;
    changeDirectory(path: string): Promise<void>;
    unlink(path: string): Promise<void>;
    runPortfolioCommand(command: string, args?: string[]): Promise<{ stdout: string; exitCode: number }>;
}
