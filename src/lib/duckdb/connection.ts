import * as duckdb from '@duckdb/duckdb-wasm';
import { loadDatabaseFromIndexedDB } from './persistence';

export async function createInMemoryDuckDBConnection(): Promise<{
  db: duckdb.AsyncDuckDB;
  connection: duckdb.AsyncDuckDBConnection;
}> {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();

  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);

  const connection = await db.connect();

  return { db, connection };
}

export async function createPersistentDuckDBConnection(dbName: string): Promise<{
  db: duckdb.AsyncDuckDB;
  connection: duckdb.AsyncDuckDBConnection;
  wasRestored: boolean;
}> {
  const { db, connection } = await createInMemoryDuckDBConnection();

  const wasRestored = await loadDatabaseFromIndexedDB(connection, dbName);

  return { db, connection, wasRestored };
}

export async function closeConnection(connection: duckdb.AsyncDuckDBConnection): Promise<void> {
  await connection.close();
}
