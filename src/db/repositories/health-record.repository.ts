import type { SQLiteDatabase } from 'expo-sqlite';

export type HealthRecord = {
  id: string;
  petId: string;
  recordedAt: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateHealthRecordInput = {
  petId: string;
  recordedAt: string;
  note: string;
};

export type HealthRecordDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type HealthRecordRow = {
  id: string;
  pet_id: string;
  recorded_at: string;
  note: string;
  created_at: string;
  updated_at: string;
};

function toHealthRecord(row: HealthRecordRow): HealthRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    recordedAt: row.recorded_at,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createHealthRecordRepository(db: HealthRecordDb) {
  async function create(input: CreateHealthRecordInput): Promise<HealthRecord> {
    const now = new Date().toISOString();
    const record: HealthRecord = { id: generateId(), ...input, createdAt: now, updatedAt: now };
    await db.runAsync(
      'INSERT INTO health_records (id, pet_id, recorded_at, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [record.id, record.petId, record.recordedAt, record.note, record.createdAt, record.updatedAt],
    );
    return record;
  }

  async function get(id: string): Promise<HealthRecord | null> {
    const row = await db.getFirstAsync<HealthRecordRow>(
      'SELECT * FROM health_records WHERE id = ?',
      [id],
    );
    return row ? toHealthRecord(row) : null;
  }

  async function listByPet(petId: string): Promise<HealthRecord[]> {
    const rows = await db.getAllAsync<HealthRecordRow>(
      'SELECT * FROM health_records WHERE pet_id = ? ORDER BY recorded_at DESC',
      [petId],
    );
    return rows.map(toHealthRecord);
  }

  async function update(
    id: string,
    input: Partial<Pick<CreateHealthRecordInput, 'recordedAt' | 'note'>>,
  ): Promise<HealthRecord | null> {
    const existing = await get(id);
    if (!existing) return null;
    const updated: HealthRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'UPDATE health_records SET recorded_at = ?, note = ?, updated_at = ? WHERE id = ?',
      [updated.recordedAt, updated.note, updated.updatedAt, id],
    );
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM health_records WHERE id = ?', [id]);
  }

  return { create, get, listByPet, update, remove };
}
