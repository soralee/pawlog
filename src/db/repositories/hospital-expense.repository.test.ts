import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import {
  createHospitalExpenseRepository,
  type HospitalExpenseDb,
} from './hospital-expense.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as HospitalExpenseDb;
  return createHospitalExpenseRepository(db);
}

test('등록 후 petId로 목록 조회하면 날짜 최신순으로 나오고, 수정/삭제가 동작한다', async () => {
  const repo = setup();
  await repo.create({ petId: 'pet-1', spentAt: '2026-09-15', amount: 40000 });
  const latest = await repo.create({ petId: 'pet-1', spentAt: '2026-10-02', amount: 85000 });

  expect((await repo.listByPet('pet-1')).map((r) => r.amount)).toEqual([85000, 40000]);

  await repo.update(latest.id, { amount: 90000 });
  expect((await repo.listByPet('pet-1'))[0].amount).toBe(90000);

  await repo.remove(latest.id);
  expect(await repo.listByPet('pet-1')).toHaveLength(1);
});

test('선택 필드를 생략하면 null로 채워지고, get으로 단건 조회할 수 있다', async () => {
  const repo = setup();
  const created = await repo.create({ petId: 'pet-1', spentAt: '2026-10-02', amount: 85000 });
  expect(created.hospitalName).toBeNull();
  expect(created.description).toBeNull();
  expect(created.memo).toBeNull();

  expect(await repo.get(created.id)).toEqual(created);
  expect(await repo.get('없는-id')).toBeNull();
});
