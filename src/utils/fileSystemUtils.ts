import { HOME_DIR } from '@/config';
import createModule from '@/public/wasm/fs/fs.js';
import { TerminalStore } from '@/store';
import { FSInstance } from '@/types';

export class WASMFileSystem {
    private fsModule: FSInstance;
    private terminalStore: TerminalStore;

    constructor(module: FSInstance, terminalStore: TerminalStore) {
        this.fsModule = module;
        this.terminalStore = terminalStore;
    }

    static async initFsModule(terminalStore: TerminalStore) {
        const fsModule: FSInstance = await createModule({
            locateFile: (path: string, prefix: string) => {
                if (path.endsWith(".wasm") || path.endsWith(".data")) return `/wasm/fs/${path}`;
                return prefix + path;
            }
        });
        fsModule.setup_filesystem(HOME_DIR);
        return new WASMFileSystem(fsModule, terminalStore);
    }

    writeFile(path: string, data: string): void {
        this.fsModule.FS.writeFile(path, data, {flags: 'a'});
    }

    readFile(path: string): string {
        if (this.fsModule.FS.isFile(this.fsModule.FS.stat(path).mode)) {
            const fileContents = this.fsModule.FS.readFile(path, {encoding: "utf8"});
            return fileContents;
        } else {
            throw Error("Not a file");
        }
    }

    cwd(): string {
        return this.fsModule.FS.cwd();
    }

    listDirectory(path: string): string[] {
        const files = this.fsModule.FS.readdir(path);
        return files;
    }

    unlink(path: string): boolean {
        this.fsModule.FS.unlink(path);
        return true;
    }

    makeDirectory(name: string): boolean {
        this.fsModule.FS.mkdir(name);
        return true;
    }

    changeDirectory(path: string): boolean {
        this.fsModule.FS.chdir(path);
        this.terminalStore.changeDirectory(this.fsModule.FS.cwd());
        return true;
    }

}