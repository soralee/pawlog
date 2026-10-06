export const createHospitalExpensesTable = `
CREATE TABLE IF NOT EXISTS hospital_expenses (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  spent_at TEXT NOT NULL,
  amount INTEGER NOT NULL,
  hospital_name TEXT,
  description TEXT,
  memo TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
