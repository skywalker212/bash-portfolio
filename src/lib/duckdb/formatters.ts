import * as arrow from 'apache-arrow';
import { CommandResult, CommandResultType, TableCommandResult, TableType } from '@/types';
import { OutputFormat } from './types';

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function formatAsTable(result: arrow.Table): TableCommandResult {
  const rows: string[][] = [];
  const headers = result.schema.fields.map((field: arrow.Field) => field.name);
  rows.push(headers);

  for (let i = 0; i < result.numRows; i++) {
    const row: string[] = [];
    for (let j = 0; j < result.numCols; j++) {
      const column = result.getChildAt(j);
      const value = column?.get(i);
      row.push(formatValue(value));
    }
    rows.push(row);
  }

  return {
    content: rows,
    type: CommandResultType.TABLE,
    tableType: TableType.NORMAL
  };
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function formatAsCSV(result: arrow.Table): CommandResult {
  const lines: string[] = [];
  const headers = result.schema.fields.map((f: arrow.Field) => f.name);
  lines.push(headers.map(escapeCsvField).join(','));

  for (let i = 0; i < result.numRows; i++) {
    const row: string[] = [];
    for (let j = 0; j < result.numCols; j++) {
      const column = result.getChildAt(j);
      const value = column?.get(i);
      row.push(escapeCsvField(formatValue(value)));
    }
    lines.push(row.join(','));
  }

  return {
    content: lines.join('\n'),
    type: CommandResultType.TEXT
  };
}

export function formatAsJSON(result: arrow.Table): CommandResult {
  const rows: Record<string, unknown>[] = [];
  const headers = result.schema.fields.map((f: arrow.Field) => f.name);

  for (let i = 0; i < result.numRows; i++) {
    const row: Record<string, unknown> = {};
    for (let j = 0; j < result.numCols; j++) {
      const column = result.getChildAt(j);
      row[headers[j]] = column?.get(i);
    }
    rows.push(row);
  }

  return {
    content: JSON.stringify(rows, null, 2),
    type: CommandResultType.TEXT
  };
}

export function formatAsMarkdown(result: arrow.Table): CommandResult {
  const lines: string[] = [];
  const headers = result.schema.fields.map((f: arrow.Field) => f.name);

  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');

  for (let i = 0; i < result.numRows; i++) {
    const row: string[] = [];
    for (let j = 0; j < result.numCols; j++) {
      const column = result.getChildAt(j);
      const value = column?.get(i);
      row.push(formatValue(value));
    }
    lines.push('| ' + row.join(' | ') + ' |');
  }

  return {
    content: lines.join('\n'),
    type: CommandResultType.TEXT
  };
}

export function formatQueryResult(
  result: arrow.Table,
  format: OutputFormat
): CommandResult {
  switch (format) {
    case 'table':
      return formatAsTable(result);
    case 'csv':
      return formatAsCSV(result);
    case 'json':
      return formatAsJSON(result);
    case 'markdown':
      return formatAsMarkdown(result);
  }
}
