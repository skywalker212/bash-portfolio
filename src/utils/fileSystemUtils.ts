import { HOME_DIR } from '@/config';
import createModule from '@/public/wasm/fs/fs.js';
import { TerminalStore } from '@/store';
import { FileSystem, FSInstance } from '@/types';

export class WASMFileSystem {
    private fs: FileSystem;
    private terminalStore: TerminalStore;

    private constructor(fs: FileSystem, terminalStore: TerminalStore) {
        this.fs = fs;
        this.terminalStore = terminalStore;
    }

    static async initFsModule(terminalStore: TerminalStore): Promise<WASMFileSystem> {
        const fsModule: FSInstance = await createModule({
            locateFile: (path: string, prefix: string) => {
                if (path.endsWith(".wasm") || path.endsWith(".data")) return `/wasm/fs/${path}`;
                return prefix + path;
            }
        });
        
        const fs = new fsModule.FileSystem(HOME_DIR);
        return new WASMFileSystem(fs, terminalStore);
    }

    writeFile(path: string, data: string): void {
        this.fs.writeFile(path, data);
    }

    readFile(path: string): string {
        return this.fs.readFile(path);
    }

    cwd(): string {
        return this.fs.cwd();
    }

    listDirectory(path: string): string[] {
        return this.fs.listDirectory(path);
    }

    unlink(path: string): boolean {
        return this.fs.unlink(path);
    }

    makeDirectory(name: string): boolean {
        return this.fs.makeDirectory(name);
    }

    changeDirectory(path: string): boolean {
        const result = this.fs.changeDirectory(path);
        if (result) {
            this.terminalStore.changeDirectory(this.fs.cwd());
        }
        return result;
    }
}