import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createCheckupRepository, type CheckupDb } from './checkup.repository';

function setup() {
  const db = createFakeSqliteDatabase() as unknown as CheckupDb;
  return createCheckupRepository(db);
}

test('checkupType은 자유 입력 텍스트로 저장된다', async () => {
  const repo = setup();
  const created = await repo.create({
    petId: 'pet-1',
    checkupType: '심장사상충 검사',
    checkedAt: '2026-09-01',
  });
  expect(created.checkupType).toBe('심장사상충 검사');
});

test('등록 후 petId로 목록 조회하면 최신순으로 나오고, 수정/삭제가 동작한다', async () => {
  const repo = setup();
  await repo.create({ petId: 'pet-1', checkupType: '종합검진', checkedAt: '2026-09-01' });
  const second = await repo.create({
    petId: 'pet-1',
    checkupType: '혈액검사',
    checkedAt: '2026-09-10',
  });

  expect((await repo.listByPet('pet-1')).map((r) => r.checkupType)).toEqual([
    '혈액검사',
    '종합검진',
  ]);

  await repo.update(second.id, { memo: '이상 없음' });
  expect((await repo.listByPet('pet-1'))[0].memo).toBe('이상 없음');

  await repo.remove(second.id);
  expect(await repo.listByPet('pet-1')).toHaveLength(1);
});

test('get으로 id 단건 조회할 수 있다', async () => {
  const repo = setup();
  const created = await repo.create({
    petId: 'pet-1',
    checkupType: '종합검진',
    checkedAt: '2026-09-01',
  });
  expect(await repo.get(created.id)).toEqual(created);
  expect(await repo.get('없는-id')).toBeNull();
});
