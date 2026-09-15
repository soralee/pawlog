import { fireEvent, render, screen } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewHealthRecordScreen from '@/app/health-record/new';
import HealthRecordDetailScreen from '@/app/health-record/[id]';
import {
  createHealthRecordRepository,
  type HealthRecordDb,
} from '@/db/repositories/health-record.repository';
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
  Stack: { Screen: () => null },
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: mockParamId }),
}));

test('등록 화면 — 유효성 검사 후 저장하면 repository에 반영되고 뒤로 간다', async () => {
  useAppStore.setState({ selectedPetId: 'pet-1' });
  mockBack.mockClear();

  await render(<NewHealthRecordScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('메모를 입력해주세요')).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('메모'), '구토함');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createHealthRecordRepository(mockDbInstance! as unknown as HealthRecordDb);
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.note)).toEqual(['구토함']);
});

test('상세 화면 — 불러오고, 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
  const repository = createHealthRecordRepository(mockDbInstance! as unknown as HealthRecordDb);
  const created = await repository.create({
    petId: 'pet-1',
    recordedAt: '2026-09-01',
    note: '구토함',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<HealthRecordDetailScreen />);

  expect(await screen.findByText('구토함')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('수정'));
  await fireEvent.changeText(screen.getByLabelText('메모'), '구토 후 정상 식사');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(await screen.findByText('구토 후 정상 식사')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('기록 삭제'));
  expect(screen.getByText('이 기록을 삭제할까요?')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('삭제'));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(await repository.get(created.id)).toBeNull();
});
