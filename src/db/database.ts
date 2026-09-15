import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'pawlog.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/** 앱 전체에서 공유하는 단일 SQLite 커넥션을 반환한다. */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return dbInstance;
}

/**
 * 마이그레이션 실행 지점. 아직 테이블 CREATE는 없다 — 첫 기능(Pet 등록)
 * 작업에서 `migrations/`에 첫 마이그레이션을 추가하며 연다.
 */
export function onInit(): void {
  getDatabase();
}
