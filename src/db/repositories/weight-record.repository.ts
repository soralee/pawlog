import type { SQLiteDatabase } from 'expo-sqlite';

export type WeightRecord = {
  id: string;
  petId: string;
  measuredAt: string;
  weightKg: number;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWeightRecordInput = {
  petId: string;
  measuredAt: string;
  weightKg: number;
  memo?: string | null;
};

export type WeightRecordDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type WeightRecordRow = {
  id: string;
  pet_id: string;
  measured_at: string;
  weight_kg: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function toWeightRecord(row: WeightRecordRow): WeightRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    measuredAt: row.measured_at,
    weightKg: row.weight_kg,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createWeightRecordRepository(db: WeightRecordDb) {
  async function create(input: CreateWeightRecordInput): Promise<WeightRecord> {
    const now = new Date().toISOString();
    const record: WeightRecord = {
      id: generateId(),
      petId: input.petId,
      measuredAt: input.measuredAt,
      weightKg: input.weightKg,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO weight_records (id, pet_id, measured_at, weight_kg, memo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        record.id,
        record.petId,
        record.measuredAt,
        record.weightKg,
        record.memo,
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  async function listByPet(petId: string): Promise<WeightRecord[]> {
    const rows = await db.getAllAsync<WeightRecordRow>(
      'SELECT * FROM weight_records WHERE pet_id = ? ORDER BY measured_at DESC',
      [petId],
    );
    return rows.map(toWeightRecord);
  }

  async function update(
    id: string,
    input: Partial<Omit<CreateWeightRecordInput, 'petId'>>,
  ): Promise<WeightRecord | null> {
    const existing = await db.getFirstAsync<WeightRecordRow>(
      'SELECT * FROM weight_records WHERE id = ?',
      [id],
    );
    if (!existing) return null;
    const updated: WeightRecord = {
      ...toWeightRecord(existing),
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'UPDATE weight_records SET measured_at = ?, weight_kg = ?, memo = ?, updated_at = ? WHERE id = ?',
      [updated.measuredAt, updated.weightKg, updated.memo, updated.updatedAt, id],
    );
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM weight_records WHERE id = ?', [id]);
  }

  return { create, listByPet, update, remove };
}
