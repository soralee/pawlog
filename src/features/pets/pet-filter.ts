import type { Pet } from '@/db/repositories/pet.repository';

export type PetFilterValue = 'all' | string;

/**
 * 펫이 1마리 이하면 펫 필터 UI 자체를 숨긴다(Graceful Mode, screen-layout.md §25.6).
 */
export function showsPetFilter(pets: Pet[]): boolean {
  return pets.length > 1;
}

export function filterByPet<T extends { petId: string }>(
  entries: T[],
  filterPetId: PetFilterValue,
): T[] {
  return filterPetId === 'all' ? entries : entries.filter((entry) => entry.petId === filterPetId);
}
