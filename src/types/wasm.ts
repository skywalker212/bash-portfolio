declare global {
    interface Window {
        fsModule: EmscriptenModuleFactory
    }
}

export type WasmModule = WebAssembly.Instance | EmscriptenModule

export interface FSInstance extends EmscriptenModule {
    FS: typeof FS;
    _setup_filesystem: () => void
}
