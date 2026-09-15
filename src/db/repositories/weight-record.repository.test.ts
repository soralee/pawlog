import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createWeightRecordRepository, type WeightRecordDb } from './weight-record.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as WeightRecordDb;
  return createWeightRecordRepository(db);
}

test('체중은 숫자로 저장/조회된다', async () => {
  const repo = setup();
  const created = await repo.create({ petId: 'pet-1', measuredAt: '2026-09-01', weightKg: 4.5 });
  expect(created.weightKg).toBe(4.5);
});

test('등록 후 petId로 목록 조회하면 최신순으로 나오고, 수정/삭제가 동작한다', async () => {
  const repo = setup();
  await repo.create({ petId: 'pet-1', measuredAt: '2026-08-01', weightKg: 4.5 });
  const latest = await repo.create({ petId: 'pet-1', measuredAt: '2026-09-01', weightKg: 4.3 });

  expect((await repo.listByPet('pet-1')).map((r) => r.weightKg)).toEqual([4.3, 4.5]);

  await repo.update(latest.id, { weightKg: 4.2 });
  expect((await repo.listByPet('pet-1'))[0].weightKg).toBe(4.2);

  await repo.remove(latest.id);
  expect(await repo.listByPet('pet-1')).toHaveLength(1);
});
