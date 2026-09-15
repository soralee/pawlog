import type { SQLiteDatabase } from 'expo-sqlite';

export type Species = 'dog' | 'cat';
export type Gender = 'male' | 'female';

export type Pet = {
  id: string;
  name: string;
  birthDate: string; // ISO 날짜 (YYYY-MM-DD)
  species: Species;
  gender: Gender;
  photoUri: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePetInput = {
  name: string;
  birthDate: string;
  species: Species;
  gender: Gender;
};

/** Repository가 실제로 쓰는 SQLiteDatabase 메서드만 좁혀서 받는다 (ADR `260915-141837`) — 테스트에선 페이크로 대체 가능. */
export type PetDb = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>;

type PetRow = {
  id: string;
  name: string;
  birth_date: string;
  species: Species;
  gender: Gender;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
};

function toPet(row: PetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    species: row.species,
    gender: row.gender,
    photoUri: row.photo_uri,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPetRepository(db: PetDb) {
  async function createPet(input: CreatePetInput): Promise<Pet> {
    const now = new Date().toISOString();
    const pet: Pet = {
      id: generateId(),
      ...input,
      photoUri: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO pets (id, name, birth_date, species, gender, photo_uri, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        pet.id,
        pet.name,
        pet.birthDate,
        pet.species,
        pet.gender,
        pet.photoUri,
        pet.createdAt,
        pet.updatedAt,
      ],
    );
    return pet;
  }

  async function getPet(id: string): Promise<Pet | null> {
    const row = await db.getFirstAsync<PetRow>('SELECT * FROM pets WHERE id = ?', [id]);
    return row ? toPet(row) : null;
  }

  async function listPets(): Promise<Pet[]> {
    const rows = await db.getAllAsync<PetRow>('SELECT * FROM pets ORDER BY created_at ASC');
    return rows.map(toPet);
  }

  async function updatePet(id: string, input: Partial<CreatePetInput>): Promise<Pet | null> {
    const existing = await getPet(id);
    if (!existing) return null;
    const updated: Pet = { ...existing, ...input, updatedAt: new Date().toISOString() };
    await db.runAsync(
      'UPDATE pets SET name = ?, birth_date = ?, species = ?, gender = ?, updated_at = ? WHERE id = ?',
      [updated.name, updated.birthDate, updated.species, updated.gender, updated.updatedAt, id],
    );
    return updated;
  }

  return { createPet, getPet, listPets, updatePet };
}
