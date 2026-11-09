import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import * as ReactNS from 'react';
import { useEffect as mockUseEffect } from 'react';

import HomeScreen from '@/app/(tabs)/index';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import {
  createHospitalExpenseRepository,
  type HospitalExpenseDb,
} from '@/db/repositories/hospital-expense.repository';
import {
  createMedicationRepository,
  type MedicationDb,
} from '@/db/repositories/medication.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
import { formatAge, formatDateForDisplay, todayDateString } from '@/utils/date';

const BUNDLE_A_FIXED_NOW = new Date('2026-11-09T12:00:00+09:00');

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));

afterEach(cleanup);

test('반려동물이 없으면 안내 문구와 반려동물 등록하기 CTA가 뜬다', async () => {
  await render(<HomeScreen />);
  expect(
    await screen.findByText('먼저 "내 반려동물" 탭에서 반려동물을 등록해주세요.'),
  ).toBeTruthy();
  expect(screen.getByLabelText('반려동물 등록하기')).toBeTruthy();
});

test('펫이 한 마리면 펫 카드와 대시보드 섹션이 보이고, 전체보기를 누르면 해당 탭으로 이동한다', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(BUNDLE_A_FIXED_NOW);

  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '종합백신',
    vaccinatedAt: '2026-06-01',
  });
  // 완료하지 않은 예정 일정("다음 일정")은 vaccinatedAt 없이 nextDueAt만 가진 별도 행이다.
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '광견병',
    nextDueAt: '2026-12-20',
  });
  const checkupRepo = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  await checkupRepo.create({
    petId: pet.id,
    checkupType: '심장 검진',
    checkedAt: '2026-10-02',
  });
  const medicationRepo = createMedicationRepository(mockDbInstance! as unknown as MedicationDb);
  await medicationRepo.create({
    petId: pet.id,
    name: '영양제',
    startDate: '2026-09-01',
    time: '21:00',
    frequency: '매일',
  });
  const expenseRepo = createHospitalExpenseRepository(
    mockDbInstance! as unknown as HospitalExpenseDb,
  );
  await expenseRepo.create({ petId: pet.id, spentAt: todayDateString(), amount: 85000 });

  await render(<HomeScreen />);

  expect(await screen.findByText('보리')).toBeTruthy();
  const hero = screen.getByLabelText('보리');
  expect(within(hero).queryByText(/오늘 복약/)).toBeNull();
  expect(within(hero).queryByText(/^D-/)).toBeNull();

  jest.useRealTimers();
  expect(screen.getByText('[보리] 종합백신')).toBeTruthy();
  expect(screen.getByText('[보리] 심장 검진')).toBeTruthy();
  expect(screen.getByText('[보리] 광견병')).toBeTruthy();
  expect(screen.getByText('[보리] 영양제')).toBeTruthy();
  // 펫이 한 마리뿐이므로 병원비 펫별 Breakdown은 보이지 않고 전체 합계만 보인다.
  expect(screen.getAllByText('85,000원')).toHaveLength(1);

  await fireEvent.press(screen.getByLabelText('기록 전체보기'));
  expect(mockPush).toHaveBeenCalledWith('/records');

  await fireEvent.press(screen.getByLabelText('일정 전체보기'));
  expect(mockPush).toHaveBeenCalledWith('/schedule');
});

test('펫이 2마리 이상이면 병원비 펫별 Breakdown이 보이고, 각 펫의 항목이 함께 집계된다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '뭉치',
    birthDate: '2019-03-01',
    species: 'dog',
    gender: 'male',
  });

  const expenseRepo = createHospitalExpenseRepository(
    mockDbInstance! as unknown as HospitalExpenseDb,
  );
  await expenseRepo.create({ petId: pet.id, spentAt: todayDateString(), amount: 50000 });

  await render(<HomeScreen />);

  // 펫 이름은 펫 카드와 병원비 Breakdown 행 양쪽에 보인다.
  expect(await screen.findAllByText('보리')).toHaveLength(2);
  expect(screen.getAllByText('뭉치')).toHaveLength(2);
  // 전체 합계(보리 85,000 + 뭉치 50,000)와 펫별 Breakdown이 함께 보인다.
  expect(screen.getByText('135,000원')).toBeTruthy();
  expect(screen.getByText('85,000원')).toBeTruthy();
  expect(screen.getByText('50,000원')).toBeTruthy();
});

describe('묶음 A — 홈 코랄 시안', () => {
  beforeEach(() => {
    mockDbInstance = mockCreateFakeSqliteDatabase();
    jest.useFakeTimers();
    jest.setSystemTime(BUNDLE_A_FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('1마리 — 인사 문구·Pet Hero(나이 · 품종)', async () => {
    const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
    await petRepository.createPet({
      name: '보리',
      birthDate: '2018-06-15',
      species: 'dog',
      gender: 'male',
    });

    await render(<HomeScreen />);

    expect(await screen.findByText('안녕하세요, 보리 보호자님')).toBeTruthy();
    expect(screen.getByText('오늘도 좋은 하루예요! 🧡')).toBeTruthy();
    expect(
      screen.getByText(`${formatAge(new Date('2018-06-15'), BUNDLE_A_FIXED_NOW)} · 강아지`),
    ).toBeTruthy();
    expect(screen.queryByText('우리 아이들')).toBeNull();
  });

  test('2마리 이상 — 가로 카드(우리 아이들)', async () => {
    const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
    await petRepository.createPet({
      name: '라떼',
      birthDate: '2020-01-01',
      species: 'cat',
      gender: 'female',
    });
    await petRepository.createPet({
      name: '모카',
      birthDate: '2021-03-01',
      species: 'dog',
      gender: 'male',
    });

    await render(<HomeScreen />);

    expect(await screen.findByText(/안녕하세요, (라떼·모카|모카·라떼) 보호자님/)).toBeTruthy();
    expect(screen.getByText('우리 아이들')).toBeTruthy();
    expect(screen.getAllByText('라떼').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('모카').length).toBeGreaterThanOrEqual(1);
  });

  test('다음 일정·최근 기록 — 날짜 포맷·병원비 포함', async () => {
    const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '보리',
      birthDate: '2018-06-15',
      species: 'dog',
      gender: 'male',
    });

    const vaccinationRepo = createVaccinationRepository(
      mockDbInstance! as unknown as VaccinationDb,
    );
    await vaccinationRepo.create({
      petId: pet.id,
      vaccineName: '광견병',
      nextDueAt: '2026-12-01',
    });

    const expenseRepo = createHospitalExpenseRepository(
      mockDbInstance! as unknown as HospitalExpenseDb,
    );
    await expenseRepo.create({
      petId: pet.id,
      spentAt: todayDateString(),
      amount: 12000,
      description: '진료비',
    });

    await render(<HomeScreen />);

    expect(await screen.findByText(formatDateForDisplay('2026-12-01', 'schedule'))).toBeTruthy();
    expect(screen.getByText('[보리] 진료비')).toBeTruthy();
  });
});

describe('묶음 B — 홈 H2', () => {
  beforeEach(() => {
    mockDbInstance = mockCreateFakeSqliteDatabase();
  });

  afterEach(async () => {
    await cleanup();
  });

  test('알림 벨은 버튼이 아니고, 병원비 차트 아이콘 testID가 유지된다', async () => {
    const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '보리',
      birthDate: '2018-06-15',
      species: 'dog',
      gender: 'male',
    });
    const expenseRepo = createHospitalExpenseRepository(
      mockDbInstance! as unknown as HospitalExpenseDb,
    );
    await expenseRepo.create({ petId: pet.id, spentAt: todayDateString(), amount: 1000 });

    await render(<HomeScreen />);

    await waitFor(() => expect(screen.getByText('안녕하세요, 보리 보호자님')).toBeTruthy());
    expect(screen.queryByLabelText('알림')).toBeNull();
    expect(screen.getByTestId('home-expense-chart-icon')).toBeTruthy();
  });

  test('다음 일정이 없으면 "일정 추가" CTA가 보인다', async () => {
    const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
    await petRepository.createPet({
      name: '콩이',
      birthDate: '2020-01-01',
      species: 'cat',
      gender: 'female',
    });

    await render(<HomeScreen />);

    expect(await screen.findByText('예정된 일정이 없어요.')).toBeTruthy();
    expect(screen.getByText('일정 추가')).toBeTruthy();
  });

  test('로딩 중에는 EmptyState가 아닌 스켈레톤만 보인다', async () => {
    const useEffectSpy = jest.spyOn(ReactNS, 'useEffect').mockImplementation(() => undefined);

    try {
      await render(<HomeScreen />);

      expect(screen.getByTestId('home-loading-skeleton')).toBeTruthy();
      expect(screen.queryByText('반려동물을 등록하고 건강 기록을 시작해 보세요.')).toBeNull();
    } finally {
      useEffectSpy.mockRestore();
    }
  });
});
