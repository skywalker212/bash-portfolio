// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
    let FS_createPath: any;
    function FS_createDataFile(parent: any, name: any, fileData: any, canRead: any, canWrite: any, canOwn: any): void;
    function FS_createPreloadedFile(parent: any, name: any, url: any, canRead: any, canWrite: any, onload: any, onerror: any, dontCreateFile: any, canOwn: any, preFinish: any): void;
    function FS_unlink(path: any): any;
    let FS_createLazyFile: any;
    let FS_createDevice: any;
    let addRunDependency: any;
    let removeRunDependency: any;
}
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export interface FileInfoVector {
  size(): number;
  get(_0: number): FileInfo | undefined;
  push_back(_0: FileInfo): void;
  resize(_0: number, _1: FileInfo): void;
  set(_0: number, _1: FileInfo): boolean;
  delete(): void;
}

export interface FileSystem {
  writeFile(_0: EmbindString, _1: EmbindString): void;
  readFile(_0: EmbindString): string;
  cwd(): string;
  getDetailedDirectoryListing(_0: EmbindString, _1: boolean): FileInfoVector;
  unlink(_0: EmbindString): boolean;
  makeDirectory(_0: EmbindString): boolean;
  changeDirectory(_0: EmbindString): boolean;
  delete(): void;
}

export type FileInfo = {
  permissions: EmbindString,
  linkCount: number,
  owner: EmbindString,
  group: EmbindString,
  size: number,
  modTime: EmbindString,
  name: EmbindString,
  isDirectory: boolean,
  isSymlink: boolean,
  linkTarget: EmbindString
};

interface EmbindModule {
  FileInfoVector: {new(): FileInfoVector};
  FileSystem: {new(_0: EmbindString, _1: any): FileSystem};
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
