import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import VaccinationScreen from '@/app/pets/[petId]/vaccination/index';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockPush = jest.fn();
let mockPetId = 'pet-empty';
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

afterEach(cleanup);

test('예방접종이 없으면 EmptyState가 뜨고, "+"를 누르면 기록/일정 선택 시트가 열린다', async () => {
  mockPetId = 'pet-empty';

  await render(<VaccinationScreen />);

  expect(await screen.findByText('등록된 예방접종이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('예방접종 추가'));
  await fireEvent.press(await screen.findByLabelText('예방접종 일정'));
  expect(mockPush).toHaveBeenCalledWith('/pets/pet-empty/vaccination/new-schedule');
});

test('완료 기록과 다음 예정일을 함께 보여주고, 완료된 접종만 목록에 나온다', async () => {
  mockPetId = 'pet-one';
  const repository = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  const completed = await repository.create({
    petId: 'pet-one',
    vaccineName: '종합백신',
    vaccinatedAt: '2026-06-01',
  });
  await repository.create({
    petId: 'pet-one',
    vaccineName: '광견병',
    nextDueAt: '2026-12-25',
  });

  await render(<VaccinationScreen />);

  await waitFor(() => expect(screen.getByText('다음 예방접종')).toBeTruthy());
  expect(screen.getByText('광견병')).toBeTruthy();
  expect(screen.getByText('종합백신')).toBeTruthy();

  await fireEvent.press(screen.getByText('종합백신'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/pet-one/vaccination/${completed.id}`);
});
