import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import MedicationScreen from '@/app/medication/index';
import {
  createMedicationRepository,
  type MedicationDb,
} from '@/db/repositories/medication.repository';
import { useAppStore } from '@/stores/app.store';

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

test('복약이 없으면 EmptyState가 뜨고, CTA를 누르면 등록 화면으로 이동한다', async () => {
  useAppStore.setState({ selectedPetId: 'pet-empty' });

  await render(<MedicationScreen />);

  expect(await screen.findByText('등록된 복약이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('복약 추가하기'));
  expect(mockPush).toHaveBeenCalledWith('/medication/new');
});

test('복용 중/종료된 복약이 분리되어 보인다', async () => {
  useAppStore.setState({ selectedPetId: 'pet-split' });

  const repository = createMedicationRepository(mockDbInstance! as unknown as MedicationDb);
  await repository.create({
    petId: 'pet-split',
    name: '영양제',
    startDate: '2026-08-01',
    time: '21:00',
    frequency: '매일',
  });
  await repository.create({
    petId: 'pet-split',
    name: '항생제',
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    time: '09:00',
    frequency: '매일',
  });

  await render(<MedicationScreen />);

  await waitFor(() => expect(screen.getByText('영양제')).toBeTruthy());
  expect(screen.getByText('복용 중')).toBeTruthy();
  expect(screen.getByText('종료된 복약')).toBeTruthy();
  expect(screen.getByText('항생제')).toBeTruthy();
});
