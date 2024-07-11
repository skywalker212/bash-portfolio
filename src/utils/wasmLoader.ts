import { WasmModule } from '@/types';

const wasmModules: WasmModule[] = [];

export const loadWasmModule = async (name: string): Promise<WebAssembly.Instance | null> => {
  const existingModule = wasmModules.find(m => m.name === name);

  if (existingModule) {
    return WebAssembly.instantiate(existingModule.module);
  }

  try {
    const response = await fetch(`/wasm/${name}.wasm`);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);

    wasmModules.push({ name, module });

    return WebAssembly.instantiate(module);
  } catch (error) {
    console.error(`Failed to load WASM module ${name}:`, error);
    return null;
  }
}