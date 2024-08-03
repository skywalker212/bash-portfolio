import NewRelic from 'newrelic';

declare global {
    interface Window {
        newrelic: typeof NewRelic;
    }
}

export type WasmModule = WebAssembly.Instance | EmscriptenModule

export interface FSInstance extends EmscriptenModule {
    FS: typeof FS;
    _setup_filesystem: () => void
}
