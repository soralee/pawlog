import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import CheckupScreen from '@/app/pets/[petId]/checkup/index';
import HealthRecordScreen from '@/app/pets/[petId]/health-record/index';
import HospitalExpenseScreen from '@/app/pets/[petId]/hospital-expense/index';
import MedicationScreen from '@/app/pets/[petId]/medication/index';
import VaccinationScreen from '@/app/pets/[petId]/vaccination/index';
import WeightScreen from '@/app/pets/[petId]/weight/index';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

let lastStackOptions: { headerRight?: () => unknown; title?: string } | undefined;
const mockPush = jest.fn();
let mockPetId = 'pet-layout';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown; title?: string } }) => {
      lastStackOptions = options;
      return options?.headerRight ? options.headerRight() : null;
    },
  },
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

type IndexCase = {
  title: string;
  Screen: ComponentType;
  bottomCtaLabel: string;
  opensOptionSheet?: boolean;
  sheetOptionLabel?: string;
};

const INDEX_CASES: IndexCase[] = [
  {
    title: '건강 기록',
    Screen: HealthRecordScreen,
    bottomCtaLabel: '건강 기록 추가',
  },
  {
    title: '예방접종',
    Screen: VaccinationScreen,
    bottomCtaLabel: '예방접종 추가',
    opensOptionSheet: true,
    sheetOptionLabel: '예방접종 기록',
  },
  {
    title: '건강검진',
    Screen: CheckupScreen,
    bottomCtaLabel: '건강검진 추가',
    opensOptionSheet: true,
    sheetOptionLabel: '건강검진 기록',
  },
  {
    title: '복약',
    Screen: MedicationScreen,
    bottomCtaLabel: '복약 추가',
  },
  {
    title: '체중',
    Screen: WeightScreen,
    bottomCtaLabel: '체중 추가',
  },
  {
    title: '병원비',
    Screen: HospitalExpenseScreen,
    bottomCtaLabel: '병원비 추가',
  },
];

beforeEach(() => {
  mockDbInstance ??= mockCreateFakeSqliteDatabase();
  mockPetId = 'pet-layout';
  lastStackOptions = undefined;
  mockPush.mockClear();
});

afterEach(cleanup);

describe.each(INDEX_CASES)('$title index', (indexCase) => {
  test('headerRight + 없이 하단 CTA가 있다', async () => {
    await render(<indexCase.Screen />);

    await waitFor(() => expect(lastStackOptions?.headerRight).toBeUndefined());
    expect(screen.getByLabelText(indexCase.bottomCtaLabel)).toBeTruthy();
  });

  test(
    indexCase.opensOptionSheet
      ? '하단 CTA가 OptionSheet를 연다'
      : '하단 CTA가 등록 화면으로 이동한다',
    async () => {
      await render(<indexCase.Screen />);

      await fireEvent.press(screen.getByLabelText(indexCase.bottomCtaLabel));

      if (indexCase.opensOptionSheet && indexCase.sheetOptionLabel) {
        expect(await screen.findByLabelText(indexCase.sheetOptionLabel)).toBeTruthy();
      } else if (indexCase.title === '건강 기록') {
        expect(mockPush).toHaveBeenCalledWith(`/pets/${mockPetId}/health-record/new`);
      } else if (indexCase.title === '복약') {
        expect(mockPush).toHaveBeenCalledWith(`/pets/${mockPetId}/medication/new`);
      } else if (indexCase.title === '체중') {
        expect(mockPush).toHaveBeenCalledWith(`/pets/${mockPetId}/weight/new`);
      } else if (indexCase.title === '병원비') {
        expect(mockPush).toHaveBeenCalledWith(`/pets/${mockPetId}/hospital-expense/new`);
      }
    },
  );
});
