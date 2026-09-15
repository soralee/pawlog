export const createWeightRecordsTable = `
CREATE TABLE IF NOT EXISTS weight_records (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  measured_at TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  memo TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
