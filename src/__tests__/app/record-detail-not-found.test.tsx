import { render, screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import CheckupDetailScreen from '@/app/pets/[petId]/checkup/[id]';
import HealthRecordDetailScreen from '@/app/pets/[petId]/health-record/[id]';
import HospitalExpenseDetailScreen from '@/app/pets/[petId]/hospital-expense/[id]';
import MedicationDetailScreen from '@/app/pets/[petId]/medication/[id]';
import VaccinationDetailScreen from '@/app/pets/[petId]/vaccination/[id]';
import WeightRecordDetailScreen from '@/app/pets/[petId]/weight/[id]';

/** Phase 1.9 — 미존재 상태 UI 기대 문구(구현 시 동일 문자열 사용). */
export const RECORD_NOT_FOUND_MESSAGE = '기록을 찾을 수 없어요';

const MISSING_RECORD_ID = 'missing-record-id';
const mockPetId = 'pet-1';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

let mockParamId = MISSING_RECORD_ID;
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockParamId, petId: mockPetId }),
}));

type DetailCase = {
  title: string;
  Screen: ComponentType;
  deleteAccessibilityLabel: string;
  repositoryModule: string;
  createRepositoryName: string;
};

const DETAIL_CASES: DetailCase[] = [
  {
    title: '체중 상세',
    Screen: WeightRecordDetailScreen,
    deleteAccessibilityLabel: '기록 삭제',
    repositoryModule: '@/db/repositories/weight-record.repository',
    createRepositoryName: 'createWeightRecordRepository',
  },
  {
    title: '예방접종 상세',
    Screen: VaccinationDetailScreen,
    deleteAccessibilityLabel: '기록 삭제',
    repositoryModule: '@/db/repositories/vaccination.repository',
    createRepositoryName: 'createVaccinationRepository',
  },
  {
    title: '건강검진 상세',
    Screen: CheckupDetailScreen,
    deleteAccessibilityLabel: '기록 삭제',
    repositoryModule: '@/db/repositories/checkup.repository',
    createRepositoryName: 'createCheckupRepository',
  },
  {
    title: '복약 상세',
    Screen: MedicationDetailScreen,
    deleteAccessibilityLabel: '복약 삭제',
    repositoryModule: '@/db/repositories/medication.repository',
    createRepositoryName: 'createMedicationRepository',
  },
  {
    title: '건강 기록 상세',
    Screen: HealthRecordDetailScreen,
    deleteAccessibilityLabel: '기록 삭제',
    repositoryModule: '@/db/repositories/health-record.repository',
    createRepositoryName: 'createHealthRecordRepository',
  },
  {
    title: '병원비 상세',
    Screen: HospitalExpenseDetailScreen,
    deleteAccessibilityLabel: '기록 삭제',
    repositoryModule: '@/db/repositories/hospital-expense.repository',
    createRepositoryName: 'createHospitalExpenseRepository',
  },
];

function stubGetNeverResolves(
  repositoryModule: string,
  createRepositoryName: string,
): jest.SpyInstance {
  const actual = jest.requireActual(repositoryModule) as Record<
    string,
    (db: unknown) => Record<string, unknown>
  >;
  const createRepository = actual[createRepositoryName];
  return jest.spyOn(actual, createRepositoryName).mockImplementation((db) => {
    const real = createRepository(db);
    return {
      ...real,
      get: () => new Promise(() => {}),
    };
  });
}

beforeEach(() => {
  mockDbInstance ??= mockCreateFakeSqliteDatabase();
  mockParamId = MISSING_RECORD_ID;
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe.each(DETAIL_CASES)('$title — Phase 1.9 미존재·로딩', (detailCase) => {
  test('로딩 중에는 삭제 버튼을 노출하지 않는다', async () => {
    stubGetNeverResolves(detailCase.repositoryModule, detailCase.createRepositoryName);

    await render(<detailCase.Screen />);

    expect(screen.queryByLabelText(detailCase.deleteAccessibilityLabel)).toBeNull();
  });

  test('getById가 null이면 미존재 문구를 보여주고 삭제 버튼을 노출하지 않는다', async () => {
    await render(<detailCase.Screen />);

    expect(await screen.findByText(RECORD_NOT_FOUND_MESSAGE)).toBeTruthy();
    expect(screen.queryByLabelText(detailCase.deleteAccessibilityLabel)).toBeNull();
  });
});
