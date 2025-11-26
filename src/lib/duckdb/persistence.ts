import * as duckdb from '@duckdb/duckdb-wasm';
import { SavedDatabase, IDB_NAME, IDB_VERSION, DB_STORE_NAME } from './types';
import * as arrow from 'apache-arrow';

export async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        db.createObjectStore(DB_STORE_NAME, { keyPath: 'name' });
      }
    };
  });
}

async function getAllTableNames(connection: duckdb.AsyncDuckDBConnection): Promise<string[]> {
  const result = await connection.query(`SELECT name FROM duckdb_tables() WHERE schema = 'main'`);
  const names: string[] = [];

  for (let i = 0; i < result.numRows; i++) {
    const nameColumn = result.getChildAt(0);
    const name = nameColumn?.get(i);
    if (name) names.push(String(name));
  }

  return names;
}

async function getSchemaStatements(connection: duckdb.AsyncDuckDBConnection): Promise<string[]> {
  const queries = [
    `SELECT sql FROM duckdb_tables() WHERE schema = 'main'`,
    `SELECT sql FROM duckdb_views() WHERE schema = 'main'`,
    `SELECT sql FROM duckdb_indexes() WHERE schema = 'main'`
  ];

  const statements: string[] = [];

  for (const query of queries) {
    try {
      const result = await connection.query(query);
      for (let i = 0; i < result.numRows; i++) {
        const sqlColumn = result.getChildAt(0);
        const sql = sqlColumn?.get(i);
        if (sql) statements.push(String(sql));
      }
    } catch {
      // Some queries might fail if no views/indexes exist, that's okay
      continue;
    }
  }

  return statements;
}

export async function exportDatabaseToIndexedDB(
  connection: duckdb.AsyncDuckDBConnection,
  dbName: string
): Promise<void> {
  const tables = await getAllTableNames(connection);
  const schema = await getSchemaStatements(connection);

  const tablesData: Record<string, ArrayBuffer> = {};

  for (const tableName of tables) {
    const result = await connection.query(`SELECT * FROM ${tableName}`);

    const writer = arrow.RecordBatchStreamWriter.writeAll(result);
    const chunks: Uint8Array[] = [];

    for await (const chunk of writer) {
      chunks.push(chunk);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    tablesData[tableName] = combined.buffer;
  }

  const savedDb: SavedDatabase = {
    name: dbName,
    timestamp: Date.now(),
    schema,
    tables: tablesData
  };

  const db = await openIndexedDB();
  const tx = db.transaction(DB_STORE_NAME, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAME);

  await new Promise<void>((resolve, reject) => {
    const request = store.put(savedDb);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  db.close();
}

export async function loadDatabaseFromIndexedDB(
  connection: duckdb.AsyncDuckDBConnection,
  dbName: string
): Promise<boolean> {
  const db = await openIndexedDB();
  const tx = db.transaction(DB_STORE_NAME, 'readonly');
  const store = tx.objectStore(DB_STORE_NAME);

  const savedDb = await new Promise<SavedDatabase | null>((resolve, reject) => {
    const request = store.get(dbName);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });

  db.close();

  if (!savedDb) {
    return false;
  }

  for (const ddl of savedDb.schema) {
    try {
      await connection.query(ddl);
    } catch (error) {
      console.error(`Failed to execute DDL: ${ddl}`, error);
      throw error;
    }
  }

  for (const [tableName, arrowBuffer] of Object.entries(savedDb.tables)) {
    const uint8Array = new Uint8Array(arrowBuffer);
    await connection.insertArrowFromIPCStream(uint8Array, {
      name: tableName
    });
  }

  return true;
}

export async function listSavedDatabases(): Promise<Array<{ name: string; timestamp: number }>> {
  const db = await openIndexedDB();
  const tx = db.transaction(DB_STORE_NAME, 'readonly');
  const store = tx.objectStore(DB_STORE_NAME);

  const databases = await new Promise<Array<{ name: string; timestamp: number }>>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result.map((db: SavedDatabase) => ({
        name: db.name,
        timestamp: db.timestamp
      }));
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });

  db.close();

  return databases;
}

export async function deleteSavedDatabase(dbName: string): Promise<void> {
  const db = await openIndexedDB();
  const tx = db.transaction(DB_STORE_NAME, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAME);

  await new Promise<void>((resolve, reject) => {
    const request = store.delete(dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  db.close();
}
