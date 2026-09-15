import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createHealthRecordRepository, type HealthRecordDb } from './health-record.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as HealthRecordDb;
  return createHealthRecordRepository(db);
}

test('등록 후 petId로 목록 조회하면 최신순으로 나온다', async () => {
  const repo = setup();
  await repo.create({ petId: 'pet-1', recordedAt: '2026-09-01', note: '구토함' });
  await repo.create({ petId: 'pet-1', recordedAt: '2026-09-10', note: '식욕 부진' });
  await repo.create({ petId: 'pet-2', recordedAt: '2026-09-05', note: '다른 반려동물 기록' });

  const list = await repo.listByPet('pet-1');
  expect(list.map((r) => r.note)).toEqual(['식욕 부진', '구토함']);
});

test('수정하면 반영되고, 삭제하면 목록에서 사라진다', async () => {
  const repo = setup();
  const created = await repo.create({ petId: 'pet-1', recordedAt: '2026-09-01', note: '구토함' });

  const updated = await repo.update(created.id, { note: '구토 후 정상 식사' });
  expect(updated?.note).toBe('구토 후 정상 식사');

  await repo.remove(created.id);
  expect(await repo.listByPet('pet-1')).toEqual([]);
});

test('존재하지 않는 id를 수정하면 null', async () => {
  const repo = setup();
  expect(await repo.update('없는-id', { note: 'x' })).toBeNull();
});

test('get으로 id 단건 조회할 수 있다', async () => {
  const repo = setup();
  const created = await repo.create({ petId: 'pet-1', recordedAt: '2026-09-01', note: '구토함' });
  expect(await repo.get(created.id)).toEqual(created);
  expect(await repo.get('없는-id')).toBeNull();
});
