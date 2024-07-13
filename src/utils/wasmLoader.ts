import { WasmModule } from '@/types';

const wasmModules: WasmModule[] = [];

export const loadWasmModule = async (name: string, imports: WebAssembly.Imports = {}): Promise<WasmModule | null> => {
  const existingModule = wasmModules.find(m => m.name === name);

  if (existingModule) {
    return existingModule;
  }

  try {
    const response = await fetch(`/wasm/${name}.wasm`);
    const module = await WebAssembly.instantiateStreaming(response, imports);

    const result = {
      name,
      instance: module.instance
    }

    wasmModules.push(result);

    return result;
  } catch (error) {
    console.error(`Failed to load WASM module ${name}:`, error);
    return null;
  }
}