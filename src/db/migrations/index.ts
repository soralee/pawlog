import { createPetsTable } from './001_create_pets';

/** 순서대로 실행되는 마이그레이션 SQL 목록. 전부 `CREATE TABLE IF NOT EXISTS`라 여러 번 실행해도 안전하다. */
export const migrations = [createPetsTable];
