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
import { useAppStore } from '@/stores/app.store';
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
  useAppStore.setState({ selectedPetId: null });
  await render(<HomeScreen />);
  expect(
    await screen.findByText('먼저 "내 반려동물" 탭에서 반려동물을 등록해주세요.'),
  ).toBeTruthy();
});

test('반려동물 정보와 대시보드 5개 섹션이 보이고, 전체보기를 누르면 기록 탭으로 이동한다', async () => {
  useAppStore.setState({ selectedPetId: null });
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });
  useAppStore.setState({ selectedPetId: pet.id });

  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '종합백신',
    vaccinatedAt: '2026-06-01',
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
  // 종합백신은 "다음 일정"(nextDueAt)과 "최근 기록"(vaccinatedAt) 양쪽에 걸쳐 나온다.
  expect(screen.getAllByText('종합백신')).toHaveLength(2);
  expect(screen.getByText('심장 검진')).toBeTruthy();
  expect(screen.getByText('영양제')).toBeTruthy();
  expect(screen.getByText('85,000원')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('전체보기'));
  expect(mockPush).toHaveBeenCalledWith('/records');
});
