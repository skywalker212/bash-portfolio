import { HOME_DIR } from '@/config';
import createModule, { FileSystem, FileInfo } from '@/public/wasm/fs/fs.js';
import { TerminalStore } from '@/store';

export class WASMFileSystem {
    private fs: FileSystem;

    private constructor(fs: FileSystem) {
        this.fs = fs;
    }

    static async initFsModule(terminalStore: TerminalStore): Promise<WASMFileSystem> {
        const fsModule = await createModule({
            locateFile: (path: string, prefix: string) => {
                if (path.endsWith(".wasm") || path.endsWith(".data")) return `/wasm/fs/${path}`;
                return prefix + path;
            }
        });
        const callbacks = {
            onChangeDirectory: (newPath: string) => {
                terminalStore.changeDirectory(newPath);
            }
        };
        const fs = new fsModule.FileSystem(HOME_DIR, callbacks);
        return new WASMFileSystem(fs);
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

    getDetailedDirectoryListing(path: string, showHidden: boolean): FileInfo[] {
        const result = this.fs.getDetailedDirectoryListing(path, showHidden);
        const length = result.size();
        const files: FileInfo[] = [];
        for (let i = 0; i < length; i++) {
            const file = result.get(i);
            if (file) files.push(file);
        }
        result.delete();
        return files;
    }

    unlink(path: string): boolean {
        return this.fs.unlink(path);
    }

    makeDirectory(name: string): boolean {
        return this.fs.makeDirectory(name);
    }

    changeDirectory(path: string): boolean {
        const result = this.fs.changeDirectory(path);
        return result;
    }
}