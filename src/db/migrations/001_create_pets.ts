export const createPetsTable = `
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  species TEXT NOT NULL,
  gender TEXT NOT NULL,
  photo_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
