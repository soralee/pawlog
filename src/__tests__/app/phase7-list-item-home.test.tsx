import { cleanup, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import HomeScreen from '@/app/(tabs)/index';
import {
  createMedicationRepository,
  type MedicationDb,
} from '@/db/repositories/medication.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import { Colors, IconTileTone } from '@/constants/theme';

const FIXED_NOW = new Date('2026-11-09T13:00:00+09:00');

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));

afterEach(async () => {
  await cleanup();
  jest.useRealTimers();
});

describe('Phase 7.6 — 홈 오늘의 복약 ListItem 텍스트 그룹 (§2.26)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  test('복약 행 텍스트 그룹은 배경색 없이, 아이콘·구분선은 유지된다', async () => {
    mockDbInstance = mockCreateFakeSqliteDatabase();
    const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '보리',
      birthDate: '2018-06-15',
      species: 'cat',
      gender: 'female',
    });

    const medicationRepo = createMedicationRepository(mockDbInstance as unknown as MedicationDb);
    await medicationRepo.create({
      petId: pet.id,
      name: '영양제',
      startDate: '2026-01-01',
      time: '09:00',
      frequency: '매일',
    });

    await render(<HomeScreen />);

    await screen.findByText('오늘의 복약');
    expect(screen.getByText('[보리] 영양제')).toBeTruthy();

    const textGroups = screen.getAllByTestId('list-item-text-group');
    expect(textGroups.length).toBeGreaterThanOrEqual(1);

    for (const group of textGroups) {
      const flat = StyleSheet.flatten(group.props.style);
      expect(flat.backgroundColor).toBeUndefined();
    }

    const row = screen.getByLabelText('[보리] 영양제');
    expect(StyleSheet.flatten(row.props.style).borderBottomWidth).toBeUndefined();
    expect(IconTileTone.warning.color).toBe(Colors.light.warning);
  });
});
