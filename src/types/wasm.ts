declare global {
    interface Window {
        fsModule: EmscriptenModuleFactory
    }
}

export type WasmModule = WebAssembly.Instance | EmscriptenModule

export interface FSInstance extends EmscriptenModule {
    FileSystem: {
        new(home_dir: string): FileSystem;
    };
}

export interface FileSystem {
    writeFile(path: string, data: string): void;
    readFile(path: string): string;
    cwd(): string;
    listDirectory(path: string): string[];
    unlink(path: string): boolean;
    makeDirectory(name: string): boolean;
    changeDirectory(path: string): boolean;
}