declare global {
    interface Window {
        fsModule: EmscriptenModuleFactory
    }
}

export type WasmModule = WebAssembly.Instance | EmscriptenModule

export interface FSInstance extends EmscriptenModule {
    FS: typeof FS;
    setup_filesystem: (home_dir: string) => boolean
}
