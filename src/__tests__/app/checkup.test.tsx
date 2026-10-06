import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewCheckupScreen from '@/app/checkup/new';
import CheckupDetailScreen from '@/app/checkup/[id]';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import { useAppStore } from '@/stores/app.store';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockBack = jest.fn();
let mockParamId = 'record-1';
jest.mock('expo-router', () => ({
  // 헤더 우측의 "수정" Text Action(options.headerRight)도 테스트에서 누를 수 있어야 한다.
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: mockParamId }),
}));

test('등록 화면 — 유효성 검사 후 저장하면 repository에 반영되고 뒤로 간다', async () => {
  useAppStore.setState({ selectedPetId: 'pet-1' });
  mockBack.mockClear();

  await render(<NewCheckupScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('검진 종류를 입력해주세요')).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('검진 종류'), '종합검진');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.checkupType)).toEqual(['종합검진']);
});

test('상세 화면 — 불러오고, 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
  const repository = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  const created = await repository.create({
    petId: 'pet-1',
    checkupType: '종합검진',
    checkedAt: '2026-09-01',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<CheckupDetailScreen />);

  expect(await screen.findByText('종합검진')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('수정'));
  await fireEvent.changeText(screen.getByLabelText('병원명'), 'OO동물병원');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(await screen.findByText('OO동물병원')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('기록 삭제'));
  await fireEvent.press(screen.getByLabelText('삭제'));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(await repository.get(created.id)).toBeNull();
});
