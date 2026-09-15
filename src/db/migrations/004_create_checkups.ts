export const createCheckupsTable = `
CREATE TABLE IF NOT EXISTS checkups (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  checkup_type TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  next_due_at TEXT,
  hospital_name TEXT,
  memo TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
