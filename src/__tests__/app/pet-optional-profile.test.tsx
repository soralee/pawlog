import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import HomeScreen from '@/app/(tabs)/index';
import PetDetailScreen from '@/app/pets/[petId]/index';
import NewPetScreen from '@/app/pets/new';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

let mockPetId = 'pet-no-age';
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

afterEach(async () => {
  await cleanup();
});

test('이름만 등록 → 펫 상세에 종류만 보이고 성별(남아/여아)은 없다', async () => {
  mockDbInstance = mockCreateFakeSqliteDatabase();
  mockBack.mockClear();

  await render(<NewPetScreen />);

  await fireEvent.changeText(await screen.findByLabelText('이름'), '콩이');
  await fireEvent.press(screen.getByLabelText('고양이'));
  await fireEvent.press(screen.getByLabelText('등록하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
  const created = (await petRepository.listPets()).find((p) => p.name === '콩이');
  expect(created?.gender).toBeNull();

  mockPetId = created!.id;
  await cleanup();
  await render(<PetDetailScreen />);

  expect(await screen.findByText('콩이')).toBeTruthy();
  expect(screen.getByText('고양이')).toBeTruthy();
  expect(screen.queryByText('고양이 · 남아')).toBeNull();
  expect(screen.queryByText('고양이 · 여아')).toBeNull();
  expect(screen.queryByText(/남아|여아/)).toBeNull();
});

test('생년월일·성별 미입력 펫 — 상세·홈에 나이·성별 없고 NaN/Invalid 문자열이 없다', async () => {
  mockDbInstance = mockCreateFakeSqliteDatabase();
  const petRepository = createPetRepository(mockDbInstance as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '콩이',
    birthDate: '',
    species: 'cat',
    gender: null,
  });
  mockPetId = pet.id;

  const detailTree = await render(<PetDetailScreen />);
  expect(await screen.findByText('콩이')).toBeTruthy();
  expect(screen.getByText('고양이')).toBeTruthy();
  expect(screen.queryByText('고양이 · 남아')).toBeNull();
  expect(screen.queryByText('고양이 · 여아')).toBeNull();
  expect(screen.queryByText(/살/)).toBeNull();
  expect(screen.queryByText(/NaN/)).toBeNull();
  expect(screen.queryByText(/Invalid/)).toBeNull();
  void detailTree.unmount();

  const homeTree = await render(<HomeScreen />);
  expect(await screen.findByText('안녕하세요, 콩이 보호자님')).toBeTruthy();
  expect(screen.getByText('고양이')).toBeTruthy();
  expect(screen.queryByText(/살/)).toBeNull();
  expect(screen.queryByText(/NaN/)).toBeNull();
  expect(screen.queryByText(/Invalid/)).toBeNull();
  void homeTree.unmount();
});
