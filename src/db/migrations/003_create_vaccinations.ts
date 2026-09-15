export const createVaccinationsTable = `
CREATE TABLE IF NOT EXISTS vaccinations (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  vaccinated_at TEXT NOT NULL,
  next_due_at TEXT,
  hospital_name TEXT,
  memo TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
