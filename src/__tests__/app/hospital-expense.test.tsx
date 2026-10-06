import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewHospitalExpenseScreen from '@/app/hospital-expense/new';
import HospitalExpenseDetailScreen from '@/app/hospital-expense/[id]';
import {
  createHospitalExpenseRepository,
  type HospitalExpenseDb,
} from '@/db/repositories/hospital-expense.repository';
import { useAppStore } from '@/stores/app.store';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockBack = jest.fn();
let mockParamId = 'expense-1';
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

  await render(<NewHospitalExpenseScreen />);

  await fireEvent.changeText(screen.getByLabelText('금액'), '이상함');
  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('금액을 숫자로 입력해주세요')).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('금액'), '85000');
  await fireEvent.changeText(screen.getByLabelText('병원명'), 'OO동물병원');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createHospitalExpenseRepository(
    mockDbInstance! as unknown as HospitalExpenseDb,
  );
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.amount)).toEqual([85000]);
});

test('상세 화면 — 불러오고, 헤더에서 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
  const repository = createHospitalExpenseRepository(
    mockDbInstance! as unknown as HospitalExpenseDb,
  );
  const created = await repository.create({
    petId: 'pet-1',
    spentAt: '2026-10-02',
    amount: 85000,
    hospitalName: 'OO동물병원',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<HospitalExpenseDetailScreen />);

  expect(await screen.findByText('85,000원')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('수정'));
  await fireEvent.changeText(screen.getByLabelText('금액'), '90000');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(await screen.findByText('90,000원')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('기록 삭제'));
  await fireEvent.press(screen.getByLabelText('삭제'));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(await repository.get(created.id)).toBeNull();
});
