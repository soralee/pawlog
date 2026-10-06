import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewMedicationScreen from '@/app/medication/new';
import MedicationDetailScreen from '@/app/medication/[id]';
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

const mockBack = jest.fn();
let mockParamId = 'medication-1';
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

  await render(<NewMedicationScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('이름을 입력해주세요')).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('이름'), '영양제');
  await fireEvent.changeText(screen.getByLabelText('복용 시간'), '21:00');
  await fireEvent.changeText(screen.getByLabelText('복용 주기'), '매일');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createMedicationRepository(mockDbInstance! as unknown as MedicationDb);
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.name)).toEqual(['영양제']);
});

test('상세 화면 — 불러오고, 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
  const repository = createMedicationRepository(mockDbInstance! as unknown as MedicationDb);
  const created = await repository.create({
    petId: 'pet-1',
    name: '영양제',
    startDate: '2026-09-01',
    time: '21:00',
    frequency: '매일',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<MedicationDetailScreen />);

  expect(await screen.findByText('영양제')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('수정'));
  await fireEvent.changeText(screen.getByLabelText('복용 시간'), '22:00');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(await screen.findByText('매일 22:00')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('복약 삭제'));
  await fireEvent.press(screen.getByLabelText('삭제'));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(await repository.get(created.id)).toBeNull();
});
