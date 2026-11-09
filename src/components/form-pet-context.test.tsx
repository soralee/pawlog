import { render, screen } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import { FormPetContext } from './form-pet-context';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

test('대상 Pet의 이름을 보여준다', async () => {
  mockDbInstance ??= mockCreateFakeSqliteDatabase();
  const repository = createPetRepository(mockDbInstance as unknown as PetDb);
  const pet = await repository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await render(<FormPetContext petId={pet.id} />);

  expect(await screen.findByText('보리')).toBeTruthy();
});
