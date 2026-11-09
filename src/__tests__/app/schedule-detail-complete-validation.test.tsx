import { addDays, format as formatDate } from 'date-fns';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import CheckupDetailScreen from '@/app/pets/[petId]/checkup/[id]';
import VaccinationDetailScreen from '@/app/pets/[petId]/vaccination/[id]';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
import { formatDateForDisplay, todayDateString } from '@/utils/date';

function expectScheduledDue(isoDate: string) {
  expect(screen.getByText(formatDateForDisplay(isoDate, 'schedule'))).toBeTruthy();
  expect(screen.queryByText('예정일')).toBeNull();
}

/** 완료하기 흐름 기대 문구 (screens 구현과 동일). */
export const COMPLETE_FUTURE_DATE_ERROR = '미래 날짜로는 완료할 수 없어요';
export const COMPLETE_INVALID_DATE_ERROR = 'YYYY-MM-DD 형식의 실제 날짜를 입력해주세요';

const FIXED_NOW = new Date('2026-11-09T12:00:00+09:00');
const TOMORROW = formatDate(addDays(FIXED_NOW, 1), 'yyyy-MM-dd');
const YESTERDAY = formatDate(addDays(FIXED_NOW, -1), 'yyyy-MM-dd');

const mockPetId = 'pet-1';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

let mockParamId = 'schedule-1';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockParamId, petId: mockPetId }),
}));

type CompleteCase = {
  title: string;
  Screen: ComponentType;
  dateFieldLabel: string;
  scheduleType: string;
  createSchedule: () => Promise<string>;
  getCompletedAt: (id: string) => Promise<string | null | undefined>;
};

const COMPLETE_CASES: CompleteCase[] = [
  {
    title: '건강검진 상세',
    Screen: CheckupDetailScreen,
    dateFieldLabel: '실제 검진일',
    scheduleType: '심장 검진',
    async createSchedule() {
      const repo = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
      const created = await repo.create({
        petId: mockPetId,
        checkupType: '심장 검진',
        nextDueAt: '2026-12-25',
      });
      return created.id;
    },
    async getCompletedAt(id) {
      return (await createCheckupRepository(mockDbInstance! as unknown as CheckupDb).get(id))
        ?.checkedAt;
    },
  },
  {
    title: '예방접종 상세',
    Screen: VaccinationDetailScreen,
    dateFieldLabel: '실제 접종일',
    scheduleType: '광견병',
    async createSchedule() {
      const repo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
      const created = await repo.create({
        petId: mockPetId,
        vaccineName: '광견병',
        nextDueAt: '2026-12-25',
      });
      return created.id;
    },
    async getCompletedAt(id) {
      return (
        await createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb).get(id)
      )?.vaccinatedAt;
    },
  },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
  mockDbInstance ??= mockCreateFakeSqliteDatabase();
});

afterEach(() => {
  jest.useRealTimers();
});

async function openCompleteForm(detailCase: CompleteCase) {
  mockParamId = await detailCase.createSchedule();
  await render(<detailCase.Screen />);
  await waitFor(() => expectScheduledDue('2026-12-25'));
  await fireEvent.press(screen.getByLabelText('완료하기'));
}

function expectCompletedDate(isoDate: string) {
  expect(screen.getByText(formatDateForDisplay(isoDate, 'schedule'))).toBeTruthy();
}

describe.each(COMPLETE_CASES)('$title — 완료하기 날짜 검증', (detailCase) => {
  test('미래 날짜(내일)는 거부하고 완료 저장하지 않는다', async () => {
    await openCompleteForm(detailCase);

    await fireEvent.changeText(screen.getByLabelText(detailCase.dateFieldLabel), TOMORROW);
    await fireEvent.press(screen.getByLabelText('완료하고 기록하기'));

    expect(await screen.findByText(COMPLETE_FUTURE_DATE_ERROR)).toBeTruthy();
    expect(await detailCase.getCompletedAt(mockParamId)).toBeNull();
  });

  test('잘못된 날짜 형식은 거부하고 완료 저장하지 않는다', async () => {
    await openCompleteForm(detailCase);

    await fireEvent.changeText(screen.getByLabelText(detailCase.dateFieldLabel), '2026-13-40');
    await fireEvent.press(screen.getByLabelText('완료하고 기록하기'));

    expect(await screen.findByText(COMPLETE_INVALID_DATE_ERROR)).toBeTruthy();
    expect(await detailCase.getCompletedAt(mockParamId)).toBeNull();
  });

  test('오늘 날짜로 완료할 수 있다', async () => {
    const today = todayDateString();
    await openCompleteForm(detailCase);

    await fireEvent.changeText(screen.getByLabelText(detailCase.dateFieldLabel), today);
    await fireEvent.press(screen.getByLabelText('완료하고 기록하기'));

    expectCompletedDate(today);
    expect(await detailCase.getCompletedAt(mockParamId)).toBe(today);
  });

  test('과거 날짜로 완료할 수 있다', async () => {
    await openCompleteForm(detailCase);

    await fireEvent.changeText(screen.getByLabelText(detailCase.dateFieldLabel), YESTERDAY);
    await fireEvent.press(screen.getByLabelText('완료하고 기록하기'));

    expectCompletedDate(YESTERDAY);
    expect(await detailCase.getCompletedAt(mockParamId)).toBe(YESTERDAY);
  });
});
