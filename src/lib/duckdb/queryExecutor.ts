import * as duckdb from '@duckdb/duckdb-wasm';
import { CommandResult, CommandResultType } from '@/types';
import { OutputFormat } from './types';
import { formatQueryResult } from './formatters';

export type QueryType = 'SELECT' | 'DML' | 'DDL';

export function detectQueryType(sql: string): QueryType {
  const trimmed = sql.trim().toUpperCase();
  if (/^(SELECT|SHOW|DESCRIBE|EXPLAIN|PRAGMA)/.test(trimmed)) {
    return 'SELECT';
  }
  if (/^(INSERT|UPDATE|DELETE)/.test(trimmed)) {
    return 'DML';
  }
  return 'DDL';
}

export async function executeSqlStatement(
  connection: duckdb.AsyncDuckDBConnection,
  sql: string,
  format: OutputFormat = 'table'
): Promise<CommandResult> {
  const queryType = detectQueryType(sql);

  if (queryType === 'SELECT') {
    const result = await connection.query(sql);

    if (result.numRows === 0) {
      return {
        type: CommandResultType.SUCCESS
      };
    }

    return formatQueryResult(result, format);
  } else {
    await connection.query(sql);
    return {
      type: CommandResultType.SUCCESS
    };
  }
}
