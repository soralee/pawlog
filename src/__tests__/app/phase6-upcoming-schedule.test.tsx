import { cleanup, render, screen } from '@testing-library/react-native';
import { addDays, format, parseISO } from 'date-fns';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import HomeScreen from '@/app/(tabs)/index';
import ScheduleScreen from '@/app/(tabs)/schedule';
import CheckupScreen from '@/app/pets/[petId]/checkup/index';
import VaccinationScreen from '@/app/pets/[petId]/vaccination/index';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
import { formatDateForDisplay, todayDateString } from '@/utils/date';

const PHASE6_NOW = new Date('2026-11-09T12:00:00+09:00');

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

let mockPetId = 'pet-phase6';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

afterEach(async () => {
  await cleanup();
  jest.useRealTimers();
});

function isoDayOffset(days: number): string {
  return format(addDays(parseISO(todayDateString()), days), 'yyyy-MM-dd');
}

async function createPet(name = '보리') {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  return petRepository.createPet({
    name,
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });
}

describe('Phase 6 / N1 — 다음 일정은 오늘 이후만 (§2.20)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(PHASE6_NOW);
    mockDbInstance = mockCreateFakeSqliteDatabase();
  });

  test('홈 — 지난+내일 일정이면 내일 일정만 다음 일정에 표시한다', async () => {
    const pet = await createPet();
    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '지난백신',
      nextDueAt: isoDayOffset(-3),
    });
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '내일백신',
      nextDueAt: isoDayOffset(1),
    });

    await render(<HomeScreen />);

    expect(await screen.findByText('다음 일정')).toBeTruthy();
    expect(screen.getByText(`[${pet.name}] 내일백신`)).toBeTruthy();
    expect(screen.getByText(formatDateForDisplay(isoDayOffset(1), 'schedule'))).toBeTruthy();
    expect(screen.queryByText(`[${pet.name}] 지난백신`)).toBeNull();
  });

  test('홈 — 지난 일정만 있으면 빈 상태·일정 추가 CTA·지난 안내', async () => {
    const pet = await createPet();
    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '광견병',
      nextDueAt: isoDayOffset(-5),
    });

    await render(<HomeScreen />);

    expect(await screen.findByText('예정된 일정이 없어요.')).toBeTruthy();
    expect(screen.getByText('일정 추가')).toBeTruthy();
    expect(screen.getByText('지난 일정은 일정 탭에서 확인할 수 있어요.')).toBeTruthy();
    expect(screen.queryByText(`[${pet.name}] 광견병`)).toBeNull();
  });

  test('홈 — 오늘 일정은 다음 일정에 포함하고 D-day 칩은 "오늘"', async () => {
    const pet = await createPet();
    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    const today = todayDateString();
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '오늘접종',
      nextDueAt: today,
    });

    await render(<HomeScreen />);

    expect(await screen.findByText(`[${pet.name}] 오늘접종`)).toBeTruthy();
    expect(screen.getByText('오늘')).toBeTruthy();
  });

  test('예방접종 index — 지난 일정만이면 상단 다음 카드에 지난 제목을 넣지 않는다', async () => {
    const pet = await createPet();
    mockPetId = pet.id;
    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '지난접종',
      nextDueAt: isoDayOffset(-2),
    });

    await render(<VaccinationScreen />);

    expect(screen.queryByText('지난접종')).toBeNull();
    expect(screen.getByText('지난 일정은 일정 탭에서 확인해 주세요.')).toBeTruthy();
  });

  test('예방접종 index — 내일 일정이 있으면 다음 예방접종 카드에 표시한다', async () => {
    const pet = await createPet();
    mockPetId = pet.id;
    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '지난접종',
      nextDueAt: isoDayOffset(-2),
    });
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '내일접종',
      nextDueAt: isoDayOffset(1),
    });

    await render(<VaccinationScreen />);

    expect(await screen.findByText('다음 예방접종')).toBeTruthy();
    expect(screen.getByText('내일접종')).toBeTruthy();
    expect(screen.queryByText('지난접종')).toBeNull();
  });

  test('건강검진 index — 내일 검진만 상단 다음 건강검진 카드에 표시한다', async () => {
    const pet = await createPet();
    mockPetId = pet.id;
    const checkupRepo = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
    await checkupRepo.create({
      petId: pet.id,
      checkupType: '지난검진',
      nextDueAt: isoDayOffset(-1),
    });
    await checkupRepo.create({
      petId: pet.id,
      checkupType: '내일검진',
      nextDueAt: isoDayOffset(1),
    });

    await render(<CheckupScreen />);

    expect(await screen.findByText('다음 건강검진')).toBeTruthy();
    expect(screen.getByText('내일검진')).toBeTruthy();
    expect(screen.queryByText('지난검진')).toBeNull();
  });

  test('일정 탭 — 지난 미완료 일정은 "지난 일정" 구역에 계속 표시한다', async () => {
    const pet = await createPet('초코');
    const overdue = isoDayOffset(-5);
    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '광견병',
      nextDueAt: overdue,
    });

    await render(<ScheduleScreen />);

    expect(await screen.findByText('지난 일정')).toBeTruthy();
    expect(screen.getByLabelText('광견병')).toBeTruthy();
  });
});
