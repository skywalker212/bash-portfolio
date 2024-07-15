import { WasmExports, WasmModule } from '@/types';

const wasmModules: { name: string, instance: WasmModule }[] = [];

export const loadWasmModule = async <T extends WasmExports = WasmExports>(name: string, type: 'wasm' | 'js', importObject?: WebAssembly.Imports): Promise<WasmModule<T>> => {
  const existingModule = wasmModules.find(m => m.name === name);
  if (existingModule) {
    return existingModule.instance as WasmModule<T>;
  }

  if (type === 'js') {
    // Load WebAssembly module with JavaScript glue code
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/wasm/${name}/${name}.js`;
      script.onload = () => {
        window.Module.onRuntimeInitialized = () => {
          const result = {
            name,
            instance: { exports: window.Module } as WasmModule
          };
          wasmModules.push(result);
          resolve(result.instance as WasmModule<T>);
        };
      };
      script.onerror = () => {
        reject(new Error(`Failed to load ${name}.js`));
      };
      document.body.appendChild(script);
    });
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

    const result = {
      name,
      instance: { exports: response.instance.exports as WasmExports } as WasmModule
    };
    wasmModules.push(result);
    return result.instance as WasmModule<T>;
  }
};