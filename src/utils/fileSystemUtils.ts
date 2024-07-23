import { HOME_DIR } from '@/config';
import createModule from '@/public/wasm/fs/fs.js';
import { TerminalStore } from '@/store';
import { FSInstance } from '@/types';

const syncFS = (fs: typeof FS, memoryToIDB: boolean = false): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        fs.syncfs(memoryToIDB, (e: Error) => {
            if (e) {
                reject(e);
            }
            resolve(true);
        })
    });
}

export class WASMFileSystem {
    private fsModule: FSInstance;
    private terminalStore: TerminalStore;

    constructor(module: FSInstance, terminalStore: TerminalStore) {
        this.fsModule = module;
        this.terminalStore = terminalStore;
    }

    static async initFsModule(terminalStore: TerminalStore) {
        const fsModule = await createModule({
            locateFile: (path: string, prefix: string) => {
                if (path.endsWith(".wasm")) return `/wasm/fs/${path}`;
                return prefix + path;
            }
        });
        await syncFS(fsModule.FS, true);
        const homeDirectory = fsModule.FS.analyzePath(HOME_DIR);
        if (!homeDirectory.exists) {
            fsModule.FS.mkdir(HOME_DIR);
            await syncFS(fsModule.FS);
        }
        fsModule.FS.chdir(HOME_DIR)
        return new WASMFileSystem(fsModule, terminalStore);
    }

    listDirectory(path?: string): string[] {
        const files = this.fsModule.FS.readdir(path ? path : this.fsModule.FS.cwd());
        return files;
    }

    async makeDirectory(name: string): Promise<boolean> {
        this.fsModule.FS.mkdir(name)
        await syncFS(this.fsModule.FS);
        return true;
    }

    changeDirectory(path: string): boolean {
        this.fsModule.FS.chdir(path);
        this.terminalStore.changeDirectory(this.fsModule.FS.cwd());
        return true;
    }

}