import type { SQLiteDatabase } from 'expo-sqlite';

export type Checkup = {
  id: string;
  petId: string;
  checkupType: string;
  checkedAt: string;
  nextDueAt: string | null;
  hospitalName: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCheckupInput = {
  petId: string;
  checkupType: string;
  checkedAt: string;
  nextDueAt?: string | null;
  hospitalName?: string | null;
  memo?: string | null;
};

export type CheckupDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type CheckupRow = {
  id: string;
  pet_id: string;
  checkup_type: string;
  checked_at: string;
  next_due_at: string | null;
  hospital_name: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function toCheckup(row: CheckupRow): Checkup {
  return {
    id: row.id,
    petId: row.pet_id,
    checkupType: row.checkup_type,
    checkedAt: row.checked_at,
    nextDueAt: row.next_due_at,
    hospitalName: row.hospital_name,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createCheckupRepository(db: CheckupDb) {
  async function create(input: CreateCheckupInput): Promise<Checkup> {
    const now = new Date().toISOString();
    const record: Checkup = {
      id: generateId(),
      petId: input.petId,
      checkupType: input.checkupType,
      checkedAt: input.checkedAt,
      nextDueAt: input.nextDueAt ?? null,
      hospitalName: input.hospitalName ?? null,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO checkups (id, pet_id, checkup_type, checked_at, next_due_at, hospital_name, memo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        record.id,
        record.petId,
        record.checkupType,
        record.checkedAt,
        record.nextDueAt,
        record.hospitalName,
        record.memo,
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  async function get(id: string): Promise<Checkup | null> {
    const row = await db.getFirstAsync<CheckupRow>('SELECT * FROM checkups WHERE id = ?', [id]);
    return row ? toCheckup(row) : null;
  }

  async function listByPet(petId: string): Promise<Checkup[]> {
    const rows = await db.getAllAsync<CheckupRow>(
      'SELECT * FROM checkups WHERE pet_id = ? ORDER BY checked_at DESC',
      [petId],
    );
    return rows.map(toCheckup);
  }

  async function update(
    id: string,
    input: Partial<Omit<CreateCheckupInput, 'petId'>>,
  ): Promise<Checkup | null> {
    const existing = await get(id);
    if (!existing) return null;
    const updated: Checkup = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'UPDATE checkups SET checkup_type = ?, checked_at = ?, next_due_at = ?, hospital_name = ?, memo = ?, updated_at = ? WHERE id = ?',
      [
        updated.checkupType,
        updated.checkedAt,
        updated.nextDueAt,
        updated.hospitalName,
        updated.memo,
        updated.updatedAt,
        id,
      ],
    );
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM checkups WHERE id = ?', [id]);
  }

  return { create, get, listByPet, update, remove };
}
