export function isCompleteSqlStatement(sql: string): boolean {
  const trimmed = sql.trim();

  if (!trimmed) return true;
  if (trimmed.startsWith('.')) return true;

  if (trimmed.endsWith(';')) return true;

  let parenDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const prevChar = i > 0 ? trimmed[i - 1] : '';

    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
  }

  if (inString || parenDepth !== 0) {
    return false;
  }

  const endsWithMultilineKeyword = /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|ORDER|HAVING|UNION|INTERSECT|EXCEPT|WITH|AS|AND|OR|WHEN|THEN|ELSE|CASE|VALUES|SET)\s*$/i.test(trimmed);

  if (endsWithMultilineKeyword) {
    return false;
  }

  return true;
}

export function appendToMultilineBuffer(buffer: string, newLine: string): string {
  return buffer ? `${buffer}\n${newLine}` : newLine;
}
