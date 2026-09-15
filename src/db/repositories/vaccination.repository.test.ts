import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createVaccinationRepository, type VaccinationDb } from './vaccination.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as VaccinationDb;
  return createVaccinationRepository(db);
}

test('등록 후 petId로 목록 조회하면 최신순으로 나온다', async () => {
  const repo = setup();
  await repo.create({ petId: 'pet-1', vaccineName: '종합백신', vaccinatedAt: '2026-09-01' });
  await repo.create({ petId: 'pet-1', vaccineName: '광견병', vaccinatedAt: '2026-09-10' });

  const list = await repo.listByPet('pet-1');
  expect(list.map((r) => r.vaccineName)).toEqual(['광견병', '종합백신']);
});

test('선택 필드를 생략하면 null로 채워지고, 수정/삭제가 동작한다', async () => {
  const repo = setup();
  const created = await repo.create({
    petId: 'pet-1',
    vaccineName: '종합백신',
    vaccinatedAt: '2026-09-01',
  });
  expect(created.nextDueAt).toBeNull();
  expect(created.hospitalName).toBeNull();

  const updated = await repo.update(created.id, { nextDueAt: '2027-09-01' });
  expect(updated?.nextDueAt).toBe('2027-09-01');

  await repo.remove(created.id);
  expect(await repo.listByPet('pet-1')).toEqual([]);
});

test('get으로 id 단건 조회할 수 있다', async () => {
  const repo = setup();
  const created = await repo.create({
    petId: 'pet-1',
    vaccineName: '종합백신',
    vaccinatedAt: '2026-09-01',
  });
  expect(await repo.get(created.id)).toEqual(created);
  expect(await repo.get('없는-id')).toBeNull();
});
