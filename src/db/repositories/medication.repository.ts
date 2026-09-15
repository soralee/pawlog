import type { SQLiteDatabase } from 'expo-sqlite';

export type Medication = {
  id: string;
  petId: string;
  name: string;
  startDate: string;
  endDate: string | null;
  time: string;
  frequency: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMedicationInput = {
  petId: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  time: string;
  frequency: string;
  memo?: string | null;
};

export type MedicationDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type MedicationRow = {
  id: string;
  pet_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  time: string;
  frequency: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function toMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    petId: row.pet_id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    time: row.time,
    frequency: row.frequency,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createMedicationRepository(db: MedicationDb) {
  async function create(input: CreateMedicationInput): Promise<Medication> {
    const now = new Date().toISOString();
    const record: Medication = {
      id: generateId(),
      petId: input.petId,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      time: input.time,
      frequency: input.frequency,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO medications (id, pet_id, name, start_date, end_date, time, frequency, memo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        record.id,
        record.petId,
        record.name,
        record.startDate,
        record.endDate,
        record.time,
        record.frequency,
        record.memo,
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  async function listByPet(petId: string): Promise<Medication[]> {
    const rows = await db.getAllAsync<MedicationRow>(
      'SELECT * FROM medications WHERE pet_id = ? ORDER BY start_date DESC',
      [petId],
    );
    return rows.map(toMedication);
  }

  async function update(
    id: string,
    input: Partial<Omit<CreateMedicationInput, 'petId'>>,
  ): Promise<Medication | null> {
    const existing = await db.getFirstAsync<MedicationRow>(
      'SELECT * FROM medications WHERE id = ?',
      [id],
    );
    if (!existing) return null;
    const updated: Medication = {
      ...toMedication(existing),
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'UPDATE medications SET name = ?, start_date = ?, end_date = ?, time = ?, frequency = ?, memo = ?, updated_at = ? WHERE id = ?',
      [
        updated.name,
        updated.startDate,
        updated.endDate,
        updated.time,
        updated.frequency,
        updated.memo,
        updated.updatedAt,
        id,
      ],
    );
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
  }

  return { create, listByPet, update, remove };
}
