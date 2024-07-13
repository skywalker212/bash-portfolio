import { WasmModule } from '@/types';

const wasmModules: WasmModule[] = [];

export const loadWasmModule = async (name: string, importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource | null> => {
  const existingModule = wasmModules.find(m => m.name === name);

  if (existingModule) {
    return existingModule.instance;
  }
  let response = undefined;

  if (!importObject) {
    importObject = {
      env: {
        abort: () => console.log("Abort!")
      }
    };
  }

  // Check if the browser supports streaming instantiation
  if (WebAssembly.instantiateStreaming) {
    // Fetch the module, and instantiate it as it is downloading
    response = await WebAssembly.instantiateStreaming(
      fetch(`/wasm/${name}.wasm`),
      importObject
    );
  } else {
    // Fallback to using fetch to download the entire module
    // And then instantiate the module
    const fetchAndInstantiateTask = async () => {
      const wasmArrayBuffer = await fetch(`/wasm/${name}.wasm`).then(response =>
        response.arrayBuffer()
      );
      return WebAssembly.instantiate(wasmArrayBuffer, importObject);
    };
    response = await fetchAndInstantiateTask();
  }

  const result = {
    name,
    instance: response
  }

  wasmModules.push(result);

  return result.instance;
};