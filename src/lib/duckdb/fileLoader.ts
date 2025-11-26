import * as duckdb from '@duckdb/duckdb-wasm';
import { WASMFileSystem } from '@/utils/fileSystemUtils';

export async function loadDatabaseFromWasmFilesystem(
  db: duckdb.AsyncDuckDB,
  wasmFs: WASMFileSystem,
  filePath: string
): Promise<void> {
  const fileContent = wasmFs.readFile(filePath);
  const encoder = new TextEncoder();
  const binaryData = encoder.encode(fileContent);

  await db.registerFileBuffer(filePath, binaryData);
}

export async function loadDatabaseFromLocalFile(
  db: duckdb.AsyncDuckDB,
  file: File
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const virtualPath = `/uploads/${file.name}`;
  await db.registerFileBuffer(virtualPath, uint8Array);
}

export function promptForFileUpload(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.duckdb,.db';
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files?.[0] || null;
      document.body.removeChild(input);
      resolve(file);
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
  });
}
