import { addDays, format, parseISO } from 'date-fns';
import { StyleSheet } from 'react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import ScheduleScreen from '@/app/(tabs)/schedule';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
import { Colors } from '@/constants/theme';
import { formatDateForDisplay, formatOverdueScheduleDays, todayDateString } from '@/utils/date';
import { cleanup, render, screen } from '@testing-library/react-native';

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

function flattenedColor(node: { props: { style?: unknown } }): string | undefined {
  const flat = StyleSheet.flatten(node.props.style as object) as { color?: string };
  return flat.color;
}

describe('Phase 7.2 — Warning 의미 텍스트 (§2.24)', () => {
  test('일정 탭 지난 일정 제목·N일 지남 본문은 warningText 색', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-09T12:00:00+09:00'));
    mockDbInstance = mockCreateFakeSqliteDatabase();

    const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '초코',
      birthDate: '2021-05-01',
      species: 'cat',
      gender: 'female',
    });
    const overdueDate = format(addDays(parseISO(todayDateString()), -5), 'yyyy-MM-dd');
    const vaccinationRepo = createVaccinationRepository(mockDbInstance as unknown as VaccinationDb);
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '광견병',
      nextDueAt: overdueDate,
    });

    await render(<ScheduleScreen />);

    const title = await screen.findByText('지난 일정');
    const body = await screen.findByText(
      `${formatDateForDisplay(overdueDate, 'schedule')} · ${formatOverdueScheduleDays(overdueDate)}`,
    );

    expect(flattenedColor(title)).toBe(Colors.light.warningText);
    expect(flattenedColor(body)).toBe(Colors.light.warningText);

    jest.useRealTimers();
  });
});
