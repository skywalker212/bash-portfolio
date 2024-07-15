import { WasmModule } from "@/types";

const wasmModules: { [key: string]: WasmModule } = {};

export const loadWasmModule = async <T extends WasmModule = WasmModule>(
  name: string,
  type: 'wasm' | 'js',
  importObject?: WebAssembly.Imports
): Promise<T> => {
  if (wasmModules[name]) {
    return wasmModules[name] as T;
  }

  if (type === 'js') {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/wasm/${name}/${name}.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${name}.js`));
      document.body.appendChild(script);
    });
    // @ts-expect-error implicit any errro
    const createModule = (window as Window)[`${name}Module`] as EmscriptenModuleFactory;

    if (!createModule) {
      throw new Error(`Create function for module ${name} not found`);
    }

    const wasmModule = await createModule();
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
        importObject
      );
    } else {
      const wasmArrayBuffer = await fetch(`/wasm/${name}/${name}.wasm`).then(response =>
        response.arrayBuffer()
      );
      response = await WebAssembly.instantiate(wasmArrayBuffer, importObject);
    }

    const wasmModule: WebAssembly.Instance = response.instance;
    wasmModules[name] = wasmModule;
    return wasmModule as T;
  }
};