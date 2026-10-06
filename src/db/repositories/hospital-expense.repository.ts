import type { SQLiteDatabase } from 'expo-sqlite';

export type HospitalExpense = {
  id: string;
  petId: string;
  spentAt: string;
  amount: number;
  hospitalName: string | null;
  description: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateHospitalExpenseInput = {
  petId: string;
  spentAt: string;
  amount: number;
  hospitalName?: string | null;
  description?: string | null;
  memo?: string | null;
};

export type HospitalExpenseDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type HospitalExpenseRow = {
  id: string;
  pet_id: string;
  spent_at: string;
  amount: number;
  hospital_name: string | null;
  description: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function toHospitalExpense(row: HospitalExpenseRow): HospitalExpense {
  return {
    id: row.id,
    petId: row.pet_id,
    spentAt: row.spent_at,
    amount: row.amount,
    hospitalName: row.hospital_name,
    description: row.description,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createHospitalExpenseRepository(db: HospitalExpenseDb) {
  async function create(input: CreateHospitalExpenseInput): Promise<HospitalExpense> {
    const now = new Date().toISOString();
    const record: HospitalExpense = {
      id: generateId(),
      petId: input.petId,
      spentAt: input.spentAt,
      amount: input.amount,
      hospitalName: input.hospitalName ?? null,
      description: input.description ?? null,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO hospital_expenses (id, pet_id, spent_at, amount, hospital_name, description, memo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        record.id,
        record.petId,
        record.spentAt,
        record.amount,
        record.hospitalName,
        record.description,
        record.memo,
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  async function get(id: string): Promise<HospitalExpense | null> {
    const row = await db.getFirstAsync<HospitalExpenseRow>(
      'SELECT * FROM hospital_expenses WHERE id = ?',
      [id],
    );
    return row ? toHospitalExpense(row) : null;
  }

  async function listByPet(petId: string): Promise<HospitalExpense[]> {
    const rows = await db.getAllAsync<HospitalExpenseRow>(
      'SELECT * FROM hospital_expenses WHERE pet_id = ? ORDER BY spent_at DESC',
      [petId],
    );
    return rows.map(toHospitalExpense);
  }

  async function update(
    id: string,
    input: Partial<Omit<CreateHospitalExpenseInput, 'petId'>>,
  ): Promise<HospitalExpense | null> {
    const existing = await get(id);
    if (!existing) return null;
    const updated: HospitalExpense = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'UPDATE hospital_expenses SET spent_at = ?, amount = ?, hospital_name = ?, description = ?, memo = ?, updated_at = ? WHERE id = ?',
      [
        updated.spentAt,
        updated.amount,
        updated.hospitalName,
        updated.description,
        updated.memo,
        updated.updatedAt,
        id,
      ],
    );
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM hospital_expenses WHERE id = ?', [id]);
  }

  return { create, get, listByPet, update, remove };
}
