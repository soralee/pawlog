import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import HospitalExpenseScreen from '@/app/hospital-expense/index';
import {
  createHospitalExpenseRepository,
  type HospitalExpenseDb,
} from '@/db/repositories/hospital-expense.repository';
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
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));

afterEach(cleanup);

test('병원비가 없으면 EmptyState가 뜨고, CTA를 누르면 등록 화면으로 이동한다', async () => {
  useAppStore.setState({ selectedPetId: 'pet-empty' });

  await render(<HospitalExpenseScreen />);

  expect(await screen.findByText('등록된 병원비가 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('병원비 추가하기'));
  expect(mockPush).toHaveBeenCalledWith('/hospital-expense/new');
});

test('이번 달 합계와 목록이 보인다', async () => {
  useAppStore.setState({ selectedPetId: 'pet-total' });

  const repository = createHospitalExpenseRepository(
    mockDbInstance! as unknown as HospitalExpenseDb,
  );
  await repository.create({
    petId: 'pet-total',
    spentAt: todayDateString(),
    amount: 40000,
    hospitalName: 'OO동물병원',
    description: '예방접종',
  });
  await repository.create({
    petId: 'pet-total',
    spentAt: todayDateString(),
    amount: 85000,
    hospitalName: 'OO동물병원',
    description: '건강검진',
  });

  await render(<HospitalExpenseScreen />);

  await waitFor(() => expect(screen.getByText('125,000원')).toBeTruthy());
  expect(screen.getByText('85,000원')).toBeTruthy();
  expect(screen.getByText('40,000원')).toBeTruthy();
  expect(screen.getByText(/건강검진/)).toBeTruthy();
  expect(screen.getByText(/예방접종/)).toBeTruthy();
});
