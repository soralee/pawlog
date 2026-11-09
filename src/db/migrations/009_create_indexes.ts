/** 펫별 목록 조회의 필터와 날짜 정렬을 함께 지원하는 복합 인덱스다. */
export const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id_recorded_at ON health_records (pet_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id_vaccinated_at ON vaccinations (pet_id, vaccinated_at);
CREATE INDEX IF NOT EXISTS idx_checkups_pet_id_checked_at ON checkups (pet_id, checked_at);
CREATE INDEX IF NOT EXISTS idx_weight_records_pet_id_measured_at ON weight_records (pet_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_medications_pet_id_start_date ON medications (pet_id, start_date);
CREATE INDEX IF NOT EXISTS idx_reminders_pet_id_scheduled_at ON reminders (pet_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_hospital_expenses_pet_id_spent_at ON hospital_expenses (pet_id, spent_at);
`;
