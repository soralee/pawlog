/**
 * Repository 단위 테스트용 아주 작은 인메모리 SQLite 페이크 (ADR `260915-141837`).
 * 실제 SQL 엔진이 아니라, 이 프로젝트가 실제로 쓰는 4가지 쿼리 패턴만 인식한다:
 *   INSERT INTO <table> (...) VALUES (...)
 *   UPDATE <table> SET col = ?, ... WHERE id = ?
 *   SELECT * FROM <table> WHERE id = ?
 *   SELECT * FROM <table> ORDER BY <col> <ASC|DESC>
 * Repository가 이 네 패턴 밖의 쿼리를 쓰면 에러를 던진다 — 새 패턴이 필요해지면 여기에 추가한다.
 */
type Row = Record<string, unknown>;

export function createFakeSqliteDatabase() {
  const tables = new Map<string, Row[]>();

  function tableOf(name: string): Row[] {
    if (!tables.has(name)) tables.set(name, []);
    return tables.get(name)!;
  }

  async function runAsync(sql: string, params: unknown[] = []) {
    const insertMatch = sql.match(/INSERT INTO (\w+)\s*\(([^)]+)\)/i);
    if (insertMatch) {
      const [, table, columnsRaw] = insertMatch;
      const columns = columnsRaw.split(',').map((c) => c.trim());
      const row: Row = {};
      columns.forEach((col, i) => {
        row[col] = params[i];
      });
      tableOf(table).push(row);
      return { changes: 1, lastInsertRowId: tableOf(table).length };
    }

    const updateMatch = sql.match(/UPDATE (\w+) SET (.+) WHERE id = \?/is);
    if (updateMatch) {
      const [, table, setClauseRaw] = updateMatch;
      const columns = setClauseRaw.split(',').map((c) => c.trim().split('=')[0].trim());
      const id = params[params.length - 1];
      const row = tableOf(table).find((r) => r.id === id);
      if (!row) return { changes: 0, lastInsertRowId: 0 };
      columns.forEach((col, i) => {
        row[col] = params[i];
      });
      return { changes: 1, lastInsertRowId: 0 };
    }

    throw new Error(`fake-sqlite-database: unsupported runAsync query: ${sql}`);
  }

  async function getFirstAsync<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const match = sql.match(/SELECT \* FROM (\w+) WHERE id = \?/i);
    if (match) {
      const [, table] = match;
      const row = tableOf(table).find((r) => r.id === params[0]);
      return (row as T) ?? null;
    }
    throw new Error(`fake-sqlite-database: unsupported getFirstAsync query: ${sql}`);
  }

  async function getAllAsync<T>(sql: string): Promise<T[]> {
    const match = sql.match(/SELECT \* FROM (\w+) ORDER BY (\w+) (ASC|DESC)/i);
    if (match) {
      const [, table, col, dir] = match;
      const rows = [...tableOf(table)];
      rows.sort((a, b) => {
        const av = String(a[col]);
        const bv = String(b[col]);
        return dir.toUpperCase() === 'ASC' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      return rows as T[];
    }
    throw new Error(`fake-sqlite-database: unsupported getAllAsync query: ${sql}`);
  }

  return { runAsync, getFirstAsync, getAllAsync };
}
