import { HOME_DIR } from '@/config';
import createModule from '@/public/wasm/fs/fs.js';
import { TerminalStore } from '@/store';
import { FSInstance } from '@/types';

const syncFS = (fs: typeof FS): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        fs.syncfs((e: Error) => {
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
        const homeDir = HOME_DIR;
        await syncFS(fsModule.FS);
        const homeDirectory = fsModule.FS.analyzePath(homeDir);
        if (!homeDirectory.exists) {
            fsModule.FS.mkdir(homeDir);
            await syncFS(fsModule.FS);
        }
        fsModule.FS.chdir(homeDir)
        return new WASMFileSystem(fsModule, terminalStore);
    }

    listDirectory(path?: string): string[] {
        const files = this.fsModule.FS.readdir(path ? path : this.terminalStore.currentDirectory);
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