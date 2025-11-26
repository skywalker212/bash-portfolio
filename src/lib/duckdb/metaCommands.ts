import { CommandResult, CommandResultType } from '@/types';
import { MetaCommand, DuckDBReplState, CommandContext, OutputFormat } from './types';
import { executeSqlStatement } from './queryExecutor';
import { exportDatabaseToIndexedDB, listSavedDatabases, deleteSavedDatabase } from './persistence';
import { loadDatabaseFromWasmFilesystem, loadDatabaseFromLocalFile, promptForFileUpload } from './fileLoader';
import { formatAsCSV, formatAsJSON } from './formatters';

const META_COMMANDS: MetaCommand[] = [
  {
    name: '.tables',
    description: 'List all tables',
    usage: '.tables [PATTERN]',
    handler: async (args, state) => {
      const pattern = args[0] ? `WHERE name LIKE '${args[0]}'` : '';
      return executeSqlStatement(
        state.connection,
        `SELECT name, estimated_size FROM duckdb_tables() ${pattern}`,
        state.outputFormat
      );
    }
  },
  {
    name: '.schema',
    description: 'Show table schema',
    usage: '.schema [TABLE_NAME]',
    handler: async (args, state) => {
      if (args[0]) {
        return executeSqlStatement(state.connection, `DESCRIBE ${args[0]}`, state.outputFormat);
      }
      return executeSqlStatement(
        state.connection,
        `SELECT sql FROM duckdb_tables()`,
        state.outputFormat
      );
    }
  },
  {
    name: '.mode',
    description: 'Set output format',
    usage: '.mode table|csv|json|markdown',
    handler: async (args, state) => {
      const format = args[0] as OutputFormat;
      if (!['table', 'csv', 'json', 'markdown'].includes(format)) {
        throw new Error('Invalid format. Use: table, csv, json, or markdown');
      }
      state.outputFormat = format;
      return {
        content: `Output format set to: ${format}`,
        type: CommandResultType.INFO
      };
    }
  },
  {
    name: '.history',
    description: 'Show query history',
    usage: '.history [N]',
    handler: async (args, state) => {
      const count = args[0] ? parseInt(args[0]) : 20;
      const recent = state.queryHistory.slice(-count);
      if (recent.length === 0) {
        return {
          content: 'No query history',
          type: CommandResultType.INFO
        };
      }
      return {
        content: recent.map((q, i) => `${i + 1}. ${q}`).join('\n'),
        type: CommandResultType.TEXT
      };
    }
  },
  {
    name: '.load',
    description: 'Load .duckdb file',
    usage: '.load local|PATH',
    handler: async (args, state, context) => {
      if (!args[0]) {
        throw new Error('Usage: .load local|PATH');
      }

      if (args[0] === 'local') {
        const file = await promptForFileUpload();
        if (!file) {
          return {
            content: 'File upload cancelled',
            type: CommandResultType.INFO
          };
        }

        try {
          await loadDatabaseFromLocalFile(state.db, file);
          state.loadedFiles.push(file.name);
          return {
            content: `Loaded database file: ${file.name}`,
            type: CommandResultType.SUCCESS
          };
        } catch (error) {
          throw new Error(`Failed to load file: ${(error as Error).message}`);
        }
      } else {
        const filePath = args[0];
        try {
          await loadDatabaseFromWasmFilesystem(state.db, context.fileSystem, filePath);
          state.loadedFiles.push(filePath);
          return {
            content: `Loaded database file: ${filePath}`,
            type: CommandResultType.SUCCESS
          };
        } catch (error) {
          throw new Error(`Failed to load file: ${(error as Error).message}`);
        }
      }
    }
  },
  {
    name: '.import',
    description: 'Import CSV/JSON file',
    usage: '.import FILE_PATH TABLE_NAME',
    handler: async (args, state) => {
      if (args.length < 2) {
        throw new Error('Usage: .import FILE_PATH TABLE_NAME');
      }

      const [filePath, tableName] = args;
      const extension = filePath.toLowerCase().split('.').pop();

      try {
        if (extension === 'csv') {
          await state.connection.query(
            `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${filePath}')`
          );
        } else if (extension === 'json') {
          await state.connection.query(
            `CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('${filePath}')`
          );
        } else {
          throw new Error('Unsupported file format. Use .csv or .json');
        }

        return {
          content: `Imported ${filePath} into table ${tableName}`,
          type: CommandResultType.SUCCESS
        };
      } catch (error) {
        throw new Error(`Failed to import file: ${(error as Error).message}`);
      }
    }
  },
  {
    name: '.export',
    description: 'Export table to file',
    usage: '.export TABLE_NAME FILE_PATH [csv|json]',
    handler: async (args, state, context) => {
      if (args.length < 2) {
        throw new Error('Usage: .export TABLE_NAME FILE_PATH [csv|json]');
      }

      const [tableName, filePath] = args;
      const format = args[2] || filePath.toLowerCase().split('.').pop() || 'csv';

      try {
        const result = await state.connection.query(`SELECT * FROM ${tableName}`);

        let fileContent: string;
        if (format === 'csv') {
          const csvResult = formatAsCSV(result);
          fileContent = csvResult.content as string;
        } else if (format === 'json') {
          const jsonResult = formatAsJSON(result);
          fileContent = jsonResult.content as string;
        } else {
          throw new Error('Unsupported format. Use csv or json');
        }

        context.fileSystem.writeFile(filePath, fileContent);

        return {
          content: `Exported ${tableName} to ${filePath}`,
          type: CommandResultType.SUCCESS
        };
      } catch (error) {
        throw new Error(`Failed to export table: ${(error as Error).message}`);
      }
    }
  },
  {
    name: '.save',
    description: 'Save database to IndexedDB',
    usage: '.save [DB_NAME]',
    handler: async (args, state) => {
      const dbName = args[0] || state.dbName;
      try {
        await exportDatabaseToIndexedDB(state.connection, dbName);
        state.isPersistent = true;
        state.dbName = dbName;
        return {
          content: `Database saved as: ${dbName}`,
          type: CommandResultType.SUCCESS
        };
      } catch (error) {
        throw new Error(`Failed to save database: ${(error as Error).message}`);
      }
    }
  },
  {
    name: '.databases',
    description: 'List saved databases',
    usage: '.databases',
    handler: async () => {
      const databases = await listSavedDatabases();
      if (databases.length === 0) {
        return {
          content: 'No saved databases',
          type: CommandResultType.INFO
        };
      }

      const rows: string[][] = [['Name', 'Saved At']];
      for (const db of databases) {
        const date = new Date(db.timestamp).toLocaleString();
        rows.push([db.name, date]);
      }

      return {
        content: rows,
        type: CommandResultType.TABLE
      };
    }
  },
  {
    name: '.drop',
    description: 'Delete a saved database',
    usage: '.drop DB_NAME',
    handler: async (args) => {
      if (!args[0]) {
        throw new Error('Database name required. Usage: .drop DB_NAME');
      }

      try {
        await deleteSavedDatabase(args[0]);
        return {
          content: `Database '${args[0]}' deleted`,
          type: CommandResultType.SUCCESS
        };
      } catch (error) {
        throw new Error(`Failed to delete database: ${(error as Error).message}`);
      }
    }
  },
  {
    name: '.help',
    description: 'Show help',
    usage: '.help [COMMAND]',
    handler: async (args) => {
      if (args[0]) {
        const cmd = findMetaCommand(args[0]);
        if (cmd) {
          return {
            content: `${cmd.name} - ${cmd.description}\nUsage: ${cmd.usage}`,
            type: CommandResultType.INFO
          };
        }
        return {
          content: `Unknown command: ${args[0]}`,
          type: CommandResultType.ERROR
        };
      }

      const helpText = `
DuckDB REPL Commands:

Meta Commands:
${META_COMMANDS.map(cmd => `  ${cmd.name.padEnd(20)} ${cmd.description}`).join('\n')}

SQL Queries:
  Type any SQL query and press Enter
  Multi-line queries are supported (query continues until semicolon or complete statement)

Output Formats:
  table     - Table format (default)
  csv       - Comma-separated values
  json      - JSON array of objects
  markdown  - Markdown table

Examples:
  CREATE TABLE users (id INT, name VARCHAR)
  INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob')
  SELECT * FROM users
  .mode json
  SELECT * FROM users
  .exit
      `.trim();

      return {
        content: helpText,
        type: CommandResultType.TEXT
      };
    }
  },
  {
    name: '.exit',
    aliases: ['.quit'],
    description: 'Exit REPL',
    usage: '.exit',
    handler: async (args, state) => {
      if (state.isPersistent) {
        try {
          await exportDatabaseToIndexedDB(state.connection, state.dbName);
        } catch (error) {
          console.error('Failed to auto-save on exit:', error);
        }
      }
      return {
        content: 'EXIT_REPL',
        type: CommandResultType.INFO,
        metadata: { shouldExit: true }
      };
    }
  }
];

export function isMetaCommand(input: string): boolean {
  return input.trim().startsWith('.');
}

export function findMetaCommand(input: string): MetaCommand | null {
  const cmd = input.split(/\s+/)[0].toLowerCase();
  return META_COMMANDS.find(
    mc => mc.name === cmd || mc.aliases?.includes(cmd)
  ) || null;
}

export async function executeMetaCommand(
  input: string,
  state: DuckDBReplState,
  context: CommandContext
): Promise<CommandResult> {
  const parts = input.trim().split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  const metaCmd = findMetaCommand(commandName);
  if (!metaCmd) {
    throw new Error(`Unknown meta command: ${commandName}. Type .help for available commands.`);
  }

  return await metaCmd.handler(args, state, context);
}
