import { createFakeSqliteDatabase } from '../testing/fake-sqlite-database';
import { createPetRepository, type PetDb } from './pet.repository';

function setup() {
  // 페이크는 실제 SQLiteDatabase의 오버로드 타입 전체가 아니라 우리가 실제로 쓰는 모양(배열 params)만
  // 구현하므로, 여기서만 PetDb로 캐스팅한다.
  const db = createFakeSqliteDatabase() as unknown as PetDb;
  return createPetRepository(db);
}

test('등록 후 조회하면 같은 반려동물이 나온다', async () => {
  const repo = setup();
  const created = await repo.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  const found = await repo.getPet(created.id);
  expect(found).toEqual(created);
});

test('존재하지 않는 id를 조회하면 null', async () => {
  const repo = setup();
  expect(await repo.getPet('없는-id')).toBeNull();
});

test('목록은 등록 순서대로 나온다', async () => {
  const repo = setup();
  await repo.createPet({ name: '보리', birthDate: '2018-06-15', species: 'dog', gender: 'male' });
  await repo.createPet({ name: '나비', birthDate: '2020-01-01', species: 'cat', gender: 'female' });

  const list = await repo.listPets();
  expect(list.map((p) => p.name)).toEqual(['보리', '나비']);
});

test('수정하면 변경된 필드만 반영되고 updatedAt이 갱신된다', async () => {
  const repo = setup();
  const created = await repo.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await new Promise((resolve) => setTimeout(resolve, 2)); // updatedAt이 createdAt과 같은 ms에 찍히지 않도록
  const updated = await repo.updatePet(created.id, { name: '보리보리' });
  expect(updated?.name).toBe('보리보리');
  expect(updated?.birthDate).toBe(created.birthDate);
  expect(updated?.updatedAt).not.toBe(created.updatedAt);

  const refetched = await repo.getPet(created.id);
  expect(refetched?.name).toBe('보리보리');
});

test('존재하지 않는 id를 수정하면 null', async () => {
  const repo = setup();
  expect(await repo.updatePet('없는-id', { name: 'x' })).toBeNull();
});
