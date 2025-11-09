import { Command, CommandResultType, TableCommandResult, TableType } from '@/types';
import { ArgumentParser } from 'js-argparse';
import * as duckdb from '@duckdb/duckdb-wasm';

const name = "duckdb";
const description = "In-memory SQL database using DuckDB";

type Args = {
    sql: string[]
}

type DuckDBCommand = Command<Args>;

const duckdbArgs = new ArgumentParser<Args>(name, description);

duckdbArgs.addArgument(['sql'], {
    required: false,
    metavar: "SQL",
    help: "SQL query to execute",
    nargs: "*",
    default: []
});

async function createFreshDuckDB(): Promise<duckdb.AsyncDuckDBConnection> {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    );

    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();

    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);

    return await db.connect();
}

async function executeQuery(conn: duckdb.AsyncDuckDBConnection, sql: string): Promise<string[][]> {
    const result = await conn.query(sql);

    // Convert Arrow table to 2D array
    const rows: string[][] = [];

    // Add header row
    const headers = result.schema.fields.map(field => field.name);
    rows.push(headers);

    // Add data rows
    for (let i = 0; i < result.numRows; i++) {
        const row: string[] = [];
        for (let j = 0; j < result.numCols; j++) {
            const column = result.getChildAt(j);
            const value = column?.get(i);
            row.push(value !== null && value !== undefined ? String(value) : 'NULL');
        }
        rows.push(row);
    }

    return rows;
}

const helpMessage = `DuckDB In-Memory SQL Database

Usage:
  duckdb                          Enter interactive REPL mode
  duckdb "SQL query"              Execute a single SQL query

REPL Commands:
  .exit                           Exit REPL mode
  .help                           Show this help message

Examples:
  duckdb
  > CREATE TABLE users (id INT, name VARCHAR, age INT)
  > INSERT INTO users VALUES (1, 'Alice', 30), (2, 'Bob', 25)
  > SELECT * FROM users
  > .exit

Or single command:
  duckdb "SELECT 1 + 1 as result"

Note: In REPL mode, database persists across queries. Exiting REPL clears the database.`;

export const duckdbCommand: DuckDBCommand = {
    name,
    args: duckdbArgs,
    description,
    execute: async ({ terminalStore }, args) => {
        try {
            const sqlInput = args.sql.join(" ").trim();

            // Check if we're in REPL mode
            const isInRepl = terminalStore.replMode === 'duckdb';

            if (isInRepl) {
                // We're in REPL mode - handle REPL commands
                const conn = terminalStore.replData as duckdb.AsyncDuckDBConnection;

                // Exit REPL
                if (sqlInput === '.exit') {
                    terminalStore.setReplMode(null);
                    return {
                        content: "Exited DuckDB REPL",
                        type: CommandResultType.INFO
                    };
                }

                // Help in REPL
                if (sqlInput === '.help' || !sqlInput) {
                    return {
                        content: helpMessage,
                        type: CommandResultType.TEXT
                    };
                }

                // Execute SQL in REPL
                const isSelectQuery = /^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN|PRAGMA)/i.test(sqlInput);

                if (isSelectQuery) {
                    const resultData = await executeQuery(conn, sqlInput);

                    if (resultData.length <= 1) {
                        return {
                            content: "Query executed successfully (0 rows returned)",
                            type: CommandResultType.SUCCESS
                        };
                    }

                    const result: TableCommandResult = {
                        content: resultData,
                        type: CommandResultType.TABLE,
                        tableType: TableType.NORMAL
                    };
                    return result;
                } else {
                    await conn.query(sqlInput);
                    return {
                        content: "Query executed successfully",
                        type: CommandResultType.SUCCESS
                    };
                }
            } else {
                // Not in REPL mode

                // No arguments - enter REPL mode
                if (!sqlInput) {
                    const conn = await createFreshDuckDB();
                    terminalStore.setReplMode('duckdb', conn);
                    return {
                        content: "Entered DuckDB REPL. Type .exit to quit, .help for help.",
                        type: CommandResultType.INFO
                    };
                }

                // Execute single SQL query with fresh database
                const conn = await createFreshDuckDB();
                const isSelectQuery = /^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN|PRAGMA)/i.test(sqlInput);

                if (isSelectQuery) {
                    const resultData = await executeQuery(conn, sqlInput);

                    if (resultData.length <= 1) {
                        return {
                            content: "Query executed successfully (0 rows returned)",
                            type: CommandResultType.SUCCESS
                        };
                    }

                    const result: TableCommandResult = {
                        content: resultData,
                        type: CommandResultType.TABLE,
                        tableType: TableType.NORMAL
                    };
                    return result;
                } else {
                    await conn.query(sqlInput);
                    return {
                        content: "Query executed successfully",
                        type: CommandResultType.SUCCESS
                    };
                }
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: `DuckDB Error: ${errorMessage}`,
                type: CommandResultType.ERROR
            };
        }
    }
};
