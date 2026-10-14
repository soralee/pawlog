import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
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
import { todayDateString } from '@/utils/date';

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

test('반려동물이 없으면 안내 문구가 뜬다', async () => {
  await render(<HomeScreen />);
  expect(
    await screen.findByText('먼저 "내 반려동물" 탭에서 반려동물을 등록해주세요.'),
  ).toBeTruthy();
});

test('펫이 한 마리면 펫 카드와 대시보드 섹션이 보이고, 전체보기를 누르면 해당 탭으로 이동한다', async () => {
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
    nextDueAt: '2026-10-20',
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
  // 오늘 복용 중인 약이 있으므로 펫 카드의 actionLabel은 다음 일정보다 복약을 우선한다.
  expect(screen.getByText('오늘 복약 21:00')).toBeTruthy();
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
