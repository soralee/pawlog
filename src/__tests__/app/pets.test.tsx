import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { addDays, format, parseISO } from 'date-fns';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import PetsScreen from '@/app/(tabs)/pets';
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

test('반려동물이 없으면 EmptyState가 뜨고, CTA를 누르면 등록 화면으로 이동한다', async () => {
  await render(<PetsScreen />);

  expect(await screen.findByText('등록된 반려동물이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('반려동물 등록하기'));
  expect(mockPush).toHaveBeenCalledWith('/pets/new');
});

test('등록된 반려동물 카드가 보이고, 누르면 Pet Detail로 이동한다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await render(<PetsScreen />);

  await waitFor(() => expect(screen.getByText('보리')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('보리'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}`);
});

test('지난 일정이 있으면 카드에 "D+N" 형태로 표시한다(음수 D-day 표시 버그 회귀 방지)', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '나비',
    birthDate: '2020-01-01',
    species: 'cat',
    gender: 'female',
  });
  const overdueDate = format(addDays(parseISO(todayDateString()), -4), 'yyyy-MM-dd');
  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '광견병',
    nextDueAt: overdueDate,
  });

  await render(<PetsScreen />);

  expect(await screen.findByText('다음 일정 · 광견병 D+4')).toBeTruthy();
});
