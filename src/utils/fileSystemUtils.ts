import { HOME_DIR } from '@/config';
import createModule, { FileSystem, FileInfo } from '@/public/wasm/fs/fs.js';
import { TerminalStore } from '@/store';

export class WASMFileSystem {
    private fs: FileSystem;
    private getExceptionMessage: (e: number) => [type: string, message: string];

    private constructor(fs: FileSystem, getExceptionMessage: (e: number) => [type: string, message: string]) {
        this.getExceptionMessage = getExceptionMessage;
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
        // @ts-expect-error fsModule doesnt include getExceptionMessage type for some reason
        return new WASMFileSystem(fs, fsModule.getExceptionMessage);
    }

    writeFile(path: string, data: string): void {
        try {
            this.fs.writeFile(path, data);
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }

    readFile(path: string): string {
        try {
            return this.fs.readFile(path);
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }

    cwd(): string {
        try {
            return this.fs.cwd();
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }

    getDetailedDirectoryListing(path: string, showHidden: boolean): FileInfo[] {
        try {
            const result = this.fs.getDetailedDirectoryListing(path, showHidden);
            const length = result.size();
            const files: FileInfo[] = [];
            for (let i = 0; i < length; i++) {
                const file = result.get(i);
                if (file) files.push(file);
            }
            result.delete();
            return files;
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }

    unlink(path: string): boolean {
        try {
            return this.fs.unlink(path);
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }

    makeDirectory(name: string): boolean {
        try {
            return this.fs.makeDirectory(name);
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }

    changeDirectory(path: string): boolean {
        try {
            const result = this.fs.changeDirectory(path);
            return result;
        } catch (e: unknown) {
            const [type, message] = this.getExceptionMessage(e as number);
            throw new Error(`${type}: ${message}`);
        }
    }
}