import { cleanup, render, screen, within } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import HomeScreen from '@/app/(tabs)/index';
import ScheduleScreen from '@/app/(tabs)/schedule';
import MedicationScreen from '@/app/pets/[petId]/medication/index';
import {
  createMedicationRepository,
  type MedicationDb,
} from '@/db/repositories/medication.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import { formatTimeForDisplay } from '@/utils/date';

/** 시뮬레이터 QA(plan/reference/qa-visual-compare.md) — 2026-11-09 13시대 KST */
const QA_FIXED_NOW = new Date('2026-11-09T13:00:00+09:00');

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockPush = jest.fn();
let mockPetId = 'pet-qa';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

afterEach(async () => {
  await cleanup();
  jest.useRealTimers();
});

/** anchor 이후 구간에서 표시 시각 라벨이 오름차순으로 등장하는지 검증한다. */
function expectDisplayedTimesInOrderAfter(anchor: string, ...times24h: string[]) {
  const labels = times24h.map((t) => formatTimeForDisplay(t));
  const treeJson = JSON.stringify(screen.toJSON());
  const anchorIndex = treeJson.indexOf(anchor);
  expect(anchorIndex).toBeGreaterThanOrEqual(0);
  const scoped = treeJson.slice(anchorIndex);
  let lastIndex = -1;
  for (const label of labels) {
    const index = scoped.indexOf(label);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeGreaterThan(lastIndex);
    lastIndex = index;
  }
}

async function seedPetWithThreeMedicationsInRepoOrder(petName = '보리') {
  mockDbInstance = mockCreateFakeSqliteDatabase();
  const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: petName,
    birthDate: '2018-06-15',
    species: 'cat',
    gender: 'female',
  });
  mockPetId = pet.id;

  const medicationRepo = createMedicationRepository(mockDbInstance as unknown as MedicationDb);
  // 저장소 반환 순서 = QA 시드와 동일(19:00 → 06:00 → 21:00)
  await medicationRepo.create({
    petId: pet.id,
    name: '저녁약',
    startDate: '2026-01-01',
    time: '19:00',
    frequency: '매일',
  });
  await medicationRepo.create({
    petId: pet.id,
    name: '아침약',
    startDate: '2026-01-01',
    time: '06:00',
    frequency: '매일',
  });
  await medicationRepo.create({
    petId: pet.id,
    name: '밤약',
    startDate: '2026-01-01',
    time: '21:00',
    frequency: '매일',
  });

  return pet;
}

describe('QA D2 — 오늘 복약 시간순 (06:00 → 19:00 → 21:00)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(QA_FIXED_NOW);
  });

  test('홈 탭 "오늘의 복약" 목록', async () => {
    await seedPetWithThreeMedicationsInRepoOrder();

    await render(<HomeScreen />);
    expect(await screen.findByText('오늘의 복약')).toBeTruthy();

    expectDisplayedTimesInOrderAfter('오늘의 복약', '06:00', '19:00', '21:00');
  });

  test('일정 탭 "오늘" 구획 복약 목록', async () => {
    await seedPetWithThreeMedicationsInRepoOrder();

    await render(<ScheduleScreen />);
    expect(await screen.findByText('오늘')).toBeTruthy();
    expect(screen.queryByText('오늘의 복약')).toBeNull();

    expectDisplayedTimesInOrderAfter('오늘', '06:00', '19:00', '21:00');
  });

  test('펫 복약 index — 복용 중 목록', async () => {
    await seedPetWithThreeMedicationsInRepoOrder();

    await render(<MedicationScreen />);
    expect(await screen.findByText('오늘의 복약')).toBeTruthy();

    expectDisplayedTimesInOrderAfter('복용 중', '06:00', '19:00', '21:00');
  });
});

describe('QA D1 — 결정 13 Hero 라벨 제거 · 복약 index 다음 복약 유지', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(QA_FIXED_NOW);
  });

  test('13:00 — Hero에 복약·D-day 라벨 줄이 없고, 복약 화면 "다음 복약" 시각은 오후 7:00', async () => {
    mockDbInstance = mockCreateFakeSqliteDatabase();
    const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '보리',
      birthDate: '2018-06-15',
      species: 'cat',
      gender: 'female',
    });
    mockPetId = pet.id;

    const medicationRepo = createMedicationRepository(mockDbInstance as unknown as MedicationDb);
    await medicationRepo.create({
      petId: pet.id,
      name: '아침약',
      startDate: '2026-01-01',
      time: '06:00',
      frequency: '매일',
    });
    await medicationRepo.create({
      petId: pet.id,
      name: '저녁약',
      startDate: '2026-01-01',
      time: '19:00',
      frequency: '매일',
    });

    const nextFormatted = formatTimeForDisplay('19:00');

    await render(<HomeScreen />);
    const hero = await screen.findByLabelText('보리');
    const heroScope = within(hero);

    expect(heroScope.queryByText(/오늘 복약/)).toBeNull();
    expect(heroScope.queryByText(/^D-/)).toBeNull();
    expect(heroScope.queryByText(new RegExp(nextFormatted))).toBeNull();

    await cleanup();
    await render(<MedicationScreen />);

    expect(await screen.findByText(new RegExp(`다음 복약은 ${nextFormatted}`))).toBeTruthy();
  });
});
