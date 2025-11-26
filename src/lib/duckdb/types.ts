import * as duckdb from '@duckdb/duckdb-wasm';
import { CommandResult } from '@/types';
import { TerminalStore } from '@/store';
import { WASMFileSystem } from '@/utils';

export type OutputFormat = 'table' | 'csv' | 'json' | 'markdown';

export interface DuckDBReplState {
  connection: duckdb.AsyncDuckDBConnection;
  db: duckdb.AsyncDuckDB;
  sessionId: string;
  dbName: string;
  isPersistent: boolean;
  queryHistory: string[];
  outputFormat: OutputFormat;
  multilineBuffer: string;
  loadedFiles: string[];
}

export interface CommandContext {
  terminalStore: TerminalStore;
  fileSystem: WASMFileSystem;
}

export interface MetaCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  handler: MetaCommandHandler;
}

export type MetaCommandHandler = (
  args: string[],
  state: DuckDBReplState,
  context: CommandContext
) => Promise<CommandResult>;

export interface SavedDatabase {
  name: string;
  timestamp: number;
  schema: string[];
  tables: Record<string, ArrayBuffer>;
}

export const DEFAULT_DB_NAME = 'terminal_database';
export const MAX_QUERY_HISTORY = 100;
export const REPL_PROMPT = 'duckdb> ';
export const MULTILINE_PROMPT = '      -> ';
export const IDB_NAME = 'terminal_duckdb_storage';
export const IDB_VERSION = 1;
export const DB_STORE_NAME = 'duckdb_databases';
