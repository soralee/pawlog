import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import PetDetailScreen from '@/app/pets/[petId]/index';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';

const mockReminderRemoveByPet = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);

jest.mock('@/db/repositories/reminder.repository', () => ({
  createReminderRepository: jest.fn(() => ({
    create: jest.fn(),
    getBySource: jest.fn(),
    listByPet: jest.fn(),
    updateNotificationId: jest.fn(),
    remove: jest.fn(),
    removeByPet: mockReminderRemoveByPet,
  })),
}));

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockBack = jest.fn();
let mockPetId = 'pet-1';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

beforeEach(() => {
  mockDbInstance ??= mockCreateFakeSqliteDatabase();
  mockReminderRemoveByPet.mockClear();
  mockBack.mockClear();
});

test('Phase 1.3 — 반려동물 삭제 확정 시 reminder 저장소 removeByPet(petId)가 호출된다', async () => {
  const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });
  mockPetId = pet.id;

  await render(<PetDetailScreen />);

  expect(await screen.findByText('보리')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('반려동물 삭제'));
  await fireEvent.press(screen.getByLabelText('삭제'));

  expect(mockReminderRemoveByPet).toHaveBeenCalledTimes(1);
  expect(mockReminderRemoveByPet).toHaveBeenCalledWith(pet.id);
  expect(mockBack).toHaveBeenCalledTimes(1);
});

describe('QA D4 — 삭제 확인 조사(을/를)', () => {
  test('이름 "나비" → "나비를 삭제할까요?"', async () => {
    const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '나비',
      birthDate: '2020-01-01',
      species: 'cat',
      gender: 'female',
    });
    mockPetId = pet.id;

    await render(<PetDetailScreen />);
    expect(await screen.findByText('나비')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('반려동물 삭제'));

    expect(screen.getByText('나비를 삭제할까요?')).toBeTruthy();
  });

  test('이름 "콩" → "콩을 삭제할까요?"', async () => {
    const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
    const pet = await petRepository.createPet({
      name: '콩',
      birthDate: '2020-01-01',
      species: 'cat',
      gender: null,
    });
    mockPetId = pet.id;

    await render(<PetDetailScreen />);
    expect(await screen.findByText('콩')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('반려동물 삭제'));

    expect(screen.getByText('콩을 삭제할까요?')).toBeTruthy();
  });
});
