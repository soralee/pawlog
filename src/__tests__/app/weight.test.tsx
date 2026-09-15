import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewWeightRecordScreen from '@/app/weight/new';
import WeightRecordDetailScreen from '@/app/weight/[id]';
import {
  createWeightRecordRepository,
  type WeightRecordDb,
} from '@/db/repositories/weight-record.repository';
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

  await render(<NewWeightRecordScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('체중을 숫자로 입력해주세요')).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('체중(kg)'), '4.3');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createWeightRecordRepository(mockDbInstance! as unknown as WeightRecordDb);
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.weightKg)).toEqual([4.3]);
});

test('상세 화면 — 불러오고, 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
  const repository = createWeightRecordRepository(mockDbInstance! as unknown as WeightRecordDb);
  const created = await repository.create({
    petId: 'pet-1',
    measuredAt: '2026-09-01',
    weightKg: 4.3,
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<WeightRecordDetailScreen />);

  expect(await screen.findByText('4.3kg')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('수정'));
  await fireEvent.changeText(screen.getByLabelText('체중(kg)'), '4.2');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(await screen.findByText('4.2kg')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('기록 삭제'));
  await fireEvent.press(screen.getByLabelText('삭제'));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(await repository.get(created.id)).toBeNull();
});
