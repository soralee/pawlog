import { createCheckupsTable } from './004_create_checkups';
import { createHealthRecordsTable } from './002_create_health_records';
import { createMedicationsTable } from './006_create_medications';
import { createPetsTable } from './001_create_pets';
import { createRemindersTable } from './007_create_reminders';
import { createVaccinationsTable } from './003_create_vaccinations';
import { createWeightRecordsTable } from './005_create_weight_records';

/** 순서대로 실행되는 마이그레이션 SQL 목록. 전부 `CREATE TABLE IF NOT EXISTS`라 여러 번 실행해도 안전하다. */
export const migrations = [
  createPetsTable,
  createHealthRecordsTable,
  createVaccinationsTable,
  createCheckupsTable,
  createWeightRecordsTable,
  createMedicationsTable,
  createRemindersTable,
];
