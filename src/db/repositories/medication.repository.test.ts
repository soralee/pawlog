import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createMedicationRepository, type MedicationDb } from './medication.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as MedicationDb;
  return createMedicationRepository(db);
}

test('등록 후 petId로 목록 조회하면 시작일 최신순으로 나온다', async () => {
  const repo = setup();
  await repo.create({
    petId: 'pet-1',
    name: '영양제',
    startDate: '2026-09-01',
    time: '21:00',
    frequency: '매일',
  });
  await repo.create({
    petId: 'pet-1',
    name: '심장약',
    startDate: '2026-09-10',
    time: '09:00',
    frequency: '매일',
  });

  const list = await repo.listByPet('pet-1');
  expect(list.map((r) => r.name)).toEqual(['심장약', '영양제']);
});

test('선택 필드를 생략하면 null로 채워지고, 수정/삭제가 동작한다', async () => {
  const repo = setup();
  const created = await repo.create({
    petId: 'pet-1',
    name: '영양제',
    startDate: '2026-09-01',
    time: '21:00',
    frequency: '매일',
  });
  expect(created.endDate).toBeNull();
  expect(created.memo).toBeNull();

  const updated = await repo.update(created.id, { time: '22:00' });
  expect(updated?.time).toBe('22:00');
  expect(updated?.name).toBe('영양제');

  await repo.remove(created.id);
  expect(await repo.listByPet('pet-1')).toEqual([]);
});

test('존재하지 않는 id를 수정하면 null', async () => {
  const repo = setup();
  expect(await repo.update('없는-id', { time: '10:00' })).toBeNull();
});
