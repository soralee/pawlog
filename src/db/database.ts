import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from './migrations';

export const DATABASE_NAME = 'pawlog.db';

/**
 * `<SQLiteProvider onInit={onInit}>`로 앱 루트에서 넘긴다 — 화면이 렌더되기 전에
 * 순서대로 마이그레이션을 실행한다. 전부 `CREATE TABLE IF NOT EXISTS`라 안전하다.
 */
export async function onInit(db: SQLiteDatabase): Promise<void> {
  for (const migration of migrations) {
    await db.execAsync(migration);
  }
}
