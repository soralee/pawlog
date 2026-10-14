import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import CheckupScreen from '@/app/pets/[petId]/checkup/index';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';

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

test('건강검진이 없으면 EmptyState가 뜨고, "+"를 누르면 기록/일정 선택 시트가 열린다', async () => {
  mockPetId = 'pet-empty';

  await render(<CheckupScreen />);

  expect(await screen.findByText('등록된 건강검진이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('건강검진 추가'));
  await fireEvent.press(await screen.findByLabelText('건강검진 기록'));
  expect(mockPush).toHaveBeenCalledWith('/pets/pet-empty/checkup/new');
});

test('완료 기록과 다음 예정일을 함께 보여주고, 완료된 검진만 목록에 나온다', async () => {
  mockPetId = 'pet-one';
  const repository = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  const completed = await repository.create({
    petId: 'pet-one',
    checkupType: '종합검진',
    checkedAt: '2026-06-01',
  });
  await repository.create({
    petId: 'pet-one',
    checkupType: '심장사상충',
    nextDueAt: '2026-12-25',
  });

  await render(<CheckupScreen />);

  await waitFor(() => expect(screen.getByText('다음 건강검진')).toBeTruthy());
  expect(screen.getByText('심장사상충')).toBeTruthy();
  expect(screen.getByText('종합검진')).toBeTruthy();

  await fireEvent.press(screen.getByText('종합검진'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/pet-one/checkup/${completed.id}`);
});
