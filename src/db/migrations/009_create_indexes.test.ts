import { onInit } from '../database';
import { createIndexes } from './009_create_indexes';

test('7개 pet_id + 날짜 복합 인덱스를 멱등적으로 만든다', () => {
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_health_records_pet_id_recorded_at ON health_records \(pet_id, recorded_at\)/,
  );
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id_vaccinated_at ON vaccinations \(pet_id, vaccinated_at\)/,
  );
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_checkups_pet_id_checked_at ON checkups \(pet_id, checked_at\)/,
  );
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_weight_records_pet_id_measured_at ON weight_records \(pet_id, measured_at\)/,
  );
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_medications_pet_id_start_date ON medications \(pet_id, start_date\)/,
  );
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_reminders_pet_id_scheduled_at ON reminders \(pet_id, scheduled_at\)/,
  );
  expect(createIndexes).toMatch(
    /CREATE INDEX IF NOT EXISTS idx_hospital_expenses_pet_id_spent_at ON hospital_expenses \(pet_id, spent_at\)/,
  );
});

test('onInit이 인덱스 마이그레이션을 등록 순서대로 실행한다', async () => {
  const execAsync = jest.fn().mockResolvedValue(undefined);

  await onInit({ execAsync } as never);

  expect(execAsync).toHaveBeenCalledWith(createIndexes);
  expect(execAsync).toHaveBeenCalledTimes(9);
});
