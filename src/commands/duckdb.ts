import { Command, CommandResultType } from '@/types';
import { ArgumentParser } from 'js-argparse';
import * as duckdb from '@duckdb/duckdb-wasm';
import { createInMemoryDuckDBConnection, createPersistentDuckDBConnection, closeConnection } from '@/lib/duckdb/connection';
import { executeSqlStatement } from '@/lib/duckdb/queryExecutor';
import { DuckDBReplState, DEFAULT_DB_NAME, MULTILINE_PROMPT } from '@/lib/duckdb/types';
import { isMetaCommand, executeMetaCommand } from '@/lib/duckdb/metaCommands';
import { isCompleteSqlStatement, appendToMultilineBuffer } from '@/lib/duckdb/sqlParser';

const name = "duckdb";
const description = "In-memory SQL database using DuckDB";

type Args = {
    sql: string[];
    persistent?: boolean;
    database?: string;
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

duckdbArgs.addArgument(['-p', '--persistent'], {
    type: "boolean",
    default: false,
    help: "Use persistent database (stored in IndexedDB)"
});

duckdbArgs.addArgument(['-d', '--database'], {
    help: "Database name (for persistent mode)",
    default: DEFAULT_DB_NAME
});

function createInitialReplState(
    db: duckdb.AsyncDuckDB,
    connection: duckdb.AsyncDuckDBConnection,
    isPersistent: boolean,
    dbName: string
): DuckDBReplState {
    return {
        connection,
        db,
        sessionId: crypto.randomUUID(),
        dbName,
        isPersistent,
        queryHistory: [],
        outputFormat: 'table',
        multilineBuffer: '',
        loadedFiles: []
    };
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
    execute: async ({ terminalStore, fileSystem }, args) => {
        try {
            const sqlInput = args.sql.join(" ").trim();
            const isInRepl = terminalStore.replMode === 'duckdb';

            if (isInRepl) {
                const state = terminalStore.replData as DuckDBReplState;

                if (isMetaCommand(sqlInput)) {
                    const result = await executeMetaCommand(sqlInput, state, { terminalStore, fileSystem });

                    if (result.metadata?.shouldExit) {
                        await closeConnection(state.connection);
                        terminalStore.setReplMode(null);
                        return {
                            content: "Exited DuckDB REPL",
                            type: CommandResultType.INFO
                        };
                    }

                    return result;
                }

                if (!sqlInput) {
                    return {
                        content: helpMessage,
                        type: CommandResultType.TEXT
                    };
                }

                state.multilineBuffer = appendToMultilineBuffer(state.multilineBuffer, sqlInput);

                if (!isCompleteSqlStatement(state.multilineBuffer)) {
                    return {
                        content: MULTILINE_PROMPT,
                        type: CommandResultType.INFO
                    };
                }

                const completeStatement = state.multilineBuffer;
                state.multilineBuffer = '';

                const result = await executeSqlStatement(state.connection, completeStatement, state.outputFormat);

                if (result.type !== CommandResultType.ERROR) {
                    state.queryHistory.push(completeStatement);
                }

                return result;
            }

            if (!sqlInput) {
                let db: duckdb.AsyncDuckDB;
                let connection: duckdb.AsyncDuckDBConnection;
                let wasRestored = false;

                if (args.persistent) {
                    const result = await createPersistentDuckDBConnection(args.database!);
                    db = result.db;
                    connection = result.connection;
                    wasRestored = result.wasRestored;
                } else {
                    const result = await createInMemoryDuckDBConnection();
                    db = result.db;
                    connection = result.connection;
                }

                const state = createInitialReplState(db, connection, args.persistent || false, args.database!);
                terminalStore.setReplMode('duckdb', state);

                const modeMsg = args.persistent
                    ? ` (persistent: ${args.database}${wasRestored ? ', restored from save' : ''})`
                    : ' (in-memory)';

                return {
                    content: `Entered DuckDB REPL${modeMsg}. Type .exit to quit, .help for help.`,
                    type: CommandResultType.INFO
                };
            }

            const { connection } = await createInMemoryDuckDBConnection();
            const result = await executeSqlStatement(connection, sqlInput, 'table');
            await closeConnection(connection);

            return result;

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: `DuckDB Error: ${errorMessage}`,
                type: CommandResultType.ERROR
            };
        }
    }
};
