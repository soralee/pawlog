import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import HealthRecordScreen from '@/app/pets/[petId]/health-record/index';
import {
  createHealthRecordRepository,
  type HealthRecordDb,
} from '@/db/repositories/health-record.repository';

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
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
  useLocalSearchParams: () => ({ petId: mockPetId }),
}));

afterEach(cleanup);

test('건강 기록이 없으면 EmptyState가 뜨고, CTA를 누르면 등록 화면으로 이동한다', async () => {
  mockPetId = 'pet-empty';

  await render(<HealthRecordScreen />);

  expect(await screen.findByText('아직 건강 기록이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('첫 기록 남기기'));
  expect(mockPush).toHaveBeenCalledWith('/pets/pet-empty/health-record/new');
});

test('기록 목록이 보이고, 항목을 누르면 상세로 이동한다', async () => {
  mockPetId = 'pet-one';
  const repository = createHealthRecordRepository(mockDbInstance! as unknown as HealthRecordDb);
  const created = await repository.create({
    petId: 'pet-one',
    recordedAt: '2026-10-01',
    note: '구토 증상',
  });

  await render(<HealthRecordScreen />);

  await waitFor(() => expect(screen.getByText('구토 증상')).toBeTruthy());

  await fireEvent.press(screen.getByText('2026-10-01'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/pet-one/health-record/${created.id}`);
});
