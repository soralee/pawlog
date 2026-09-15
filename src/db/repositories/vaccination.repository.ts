import type { SQLiteDatabase } from 'expo-sqlite';

export type Vaccination = {
  id: string;
  petId: string;
  vaccineName: string;
  vaccinatedAt: string;
  nextDueAt: string | null;
  hospitalName: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateVaccinationInput = {
  petId: string;
  vaccineName: string;
  vaccinatedAt: string;
  nextDueAt?: string | null;
  hospitalName?: string | null;
  memo?: string | null;
};

export type VaccinationDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type VaccinationRow = {
  id: string;
  pet_id: string;
  vaccine_name: string;
  vaccinated_at: string;
  next_due_at: string | null;
  hospital_name: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function toVaccination(row: VaccinationRow): Vaccination {
  return {
    id: row.id,
    petId: row.pet_id,
    vaccineName: row.vaccine_name,
    vaccinatedAt: row.vaccinated_at,
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

export function createVaccinationRepository(db: VaccinationDb) {
  async function create(input: CreateVaccinationInput): Promise<Vaccination> {
    const now = new Date().toISOString();
    const record: Vaccination = {
      id: generateId(),
      petId: input.petId,
      vaccineName: input.vaccineName,
      vaccinatedAt: input.vaccinatedAt,
      nextDueAt: input.nextDueAt ?? null,
      hospitalName: input.hospitalName ?? null,
      memo: input.memo ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO vaccinations (id, pet_id, vaccine_name, vaccinated_at, next_due_at, hospital_name, memo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        record.id,
        record.petId,
        record.vaccineName,
        record.vaccinatedAt,
        record.nextDueAt,
        record.hospitalName,
        record.memo,
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  async function get(id: string): Promise<Vaccination | null> {
    const row = await db.getFirstAsync<VaccinationRow>('SELECT * FROM vaccinations WHERE id = ?', [
      id,
    ]);
    return row ? toVaccination(row) : null;
  }

  async function listByPet(petId: string): Promise<Vaccination[]> {
    const rows = await db.getAllAsync<VaccinationRow>(
      'SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccinated_at DESC',
      [petId],
    );
    return rows.map(toVaccination);
  }

  async function update(
    id: string,
    input: Partial<Omit<CreateVaccinationInput, 'petId'>>,
  ): Promise<Vaccination | null> {
    const existing = await get(id);
    if (!existing) return null;
    const updated: Vaccination = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'UPDATE vaccinations SET vaccine_name = ?, vaccinated_at = ?, next_due_at = ?, hospital_name = ?, memo = ?, updated_at = ? WHERE id = ?',
      [
        updated.vaccineName,
        updated.vaccinatedAt,
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
    await db.runAsync('DELETE FROM vaccinations WHERE id = ?', [id]);
  }

  return { create, get, listByPet, update, remove };
}
