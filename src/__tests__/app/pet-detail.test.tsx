import { fireEvent, render, screen } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import PetDetailScreen from '@/app/pets/[petId]/index';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockPush = jest.fn();
let mockPetId = 'pet-1';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

test('건강 관리 메뉴의 각 항목이 해당 Pet으로 Scope된 화면으로 이동한다', async () => {
  mockDbInstance ??= mockCreateFakeSqliteDatabase();
  const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });
  mockPetId = pet.id;
  mockPush.mockClear();

  await render(<PetDetailScreen />);

  expect(await screen.findByText('보리')).toBeTruthy();

  await fireEvent.press(screen.getByText('건강 기록'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/health-record`);

  await fireEvent.press(screen.getByText('예방접종'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/vaccination`);

  await fireEvent.press(screen.getByText('건강검진'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/checkup`);

  await fireEvent.press(screen.getByText('체중'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/weight`);

  await fireEvent.press(screen.getByText('복약'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/medication`);

  await fireEvent.press(screen.getByText('병원비'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/hospital-expense`);
});
