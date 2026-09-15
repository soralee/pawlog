export const createHealthRecordsTable = `
CREATE TABLE IF NOT EXISTS health_records (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
