import type { Pet } from '@/db/repositories/pet.repository';
import { filterByPet, showsPetFilter } from './pet-filter';

function makePet(id: string): Pet {
  return {
    id,
    name: id,
    birthDate: '2020-01-01',
    species: 'dog',
    gender: 'male',
    photoUri: null,
    createdAt: '',
    updatedAt: '',
  };
}

test('펫이 2마리 이상일 때만 펫 필터를 보여준다', () => {
  expect(showsPetFilter([])).toBe(false);
  expect(showsPetFilter([makePet('p1')])).toBe(false);
  expect(showsPetFilter([makePet('p1'), makePet('p2')])).toBe(true);
});

test('filterByPet — "전체"면 그대로, 특정 petId면 해당 펫 것만 남긴다', () => {
  const entries = [
    { id: 'e1', petId: 'p1' },
    { id: 'e2', petId: 'p2' },
  ];
  expect(filterByPet(entries, 'all')).toEqual(entries);
  expect(filterByPet(entries, 'p1')).toEqual([{ id: 'e1', petId: 'p1' }]);
});
