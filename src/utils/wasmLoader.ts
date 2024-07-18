import { WasmModule } from "@/types";

const wasmModules: { [key: string]: WasmModule } = {};

export const loadWasmModule = async <T extends WasmModule = WasmModule>(
  name: string,
  type: 'wasm' | 'js',
  importObject?: WebAssembly.Imports | EmscriptenModule
): Promise<T> => {
  if (wasmModules[name]) {
    return wasmModules[name] as T;
  }

  if (type === 'js') {
    // Dynamic import for JS-wrapped WASM modules
    const moduleImport = await import(`@/public/wasm/${name}/${name}.js`);
    const createModule = moduleImport.default as EmscriptenModuleFactory;

    if (!createModule) {
      throw new Error(`Create function for module ${name} not found`);
    }

    const wasmModule = await createModule({
      locateFile: (path, prefix) => {
        if (path.endsWith(".wasm")) return `/wasm/${name}/${path}`;
        return prefix + path;
      },
      ...importObject
    });
    wasmModules[name] = wasmModule;

    return wasmModule as T;
  } else {
    // Load standalone WebAssembly module
    if (!importObject) {
      importObject = {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, maximum: 256 })
        }
      };
    }

    let response: WebAssembly.WebAssemblyInstantiatedSource;

    if (WebAssembly.instantiateStreaming) {
      response = await WebAssembly.instantiateStreaming(
        fetch(`/wasm/${name}/${name}.wasm`),
        importObject as WebAssembly.Imports
      );
    } else {
      const wasmArrayBuffer = await fetch(`/wasm/${name}/${name}.wasm`).then(response =>
        response.arrayBuffer()
      );
      response = await WebAssembly.instantiate(wasmArrayBuffer, importObject as WebAssembly.Imports);
    }

    const wasmModule: WebAssembly.Instance = response.instance;
    wasmModules[name] = wasmModule;
    return wasmModule as T;
  }
};