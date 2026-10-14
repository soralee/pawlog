import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { format, parseISO, subMonths } from 'date-fns';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import WeightScreen from '@/app/pets/[petId]/weight/index';
import {
  createWeightRecordRepository,
  type WeightRecordDb,
} from '@/db/repositories/weight-record.repository';
import { todayDateString } from '@/utils/date';

jest.mock('react-native-gifted-charts', () => ({ LineChart: () => null }));

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

test('체중 기록이 없으면 EmptyState가 뜨고, CTA를 누르면 등록 화면으로 이동한다', async () => {
  mockPetId = 'pet-empty';

  await render(<WeightScreen />);

  expect(await screen.findByText('등록된 체중 기록이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('체중 추가하기'));
  expect(mockPush).toHaveBeenCalledWith('/pets/pet-empty/weight/new');
});

test('기록이 1개뿐이면 현재 체중만 보이고 변화량은 보이지 않는다', async () => {
  mockPetId = 'pet-one';
  const repository = createWeightRecordRepository(mockDbInstance! as unknown as WeightRecordDb);
  await repository.create({ petId: 'pet-one', measuredAt: todayDateString(), weightKg: 4.3 });

  await render(<WeightScreen />);

  // "현재" 요약 카드와 목록 행 양쪽에 같은 체중이 보인다.
  expect(await screen.findAllByText('4.3kg')).toHaveLength(2);
  expect(screen.queryByText(/최근 6개월/)).toBeNull();
});

test('기록이 2개 이상이면 최근 6개월 변화량과 목록이 보이고, 항목을 누르면 상세로 이동한다', async () => {
  mockPetId = 'pet-two';
  const twoMonthsAgo = format(subMonths(parseISO(todayDateString()), 2), 'yyyy-MM-dd');
  const repository = createWeightRecordRepository(mockDbInstance! as unknown as WeightRecordDb);
  const first = await repository.create({
    petId: 'pet-two',
    measuredAt: twoMonthsAgo,
    weightKg: 4.0,
  });
  await repository.create({ petId: 'pet-two', measuredAt: todayDateString(), weightKg: 4.3 });

  await render(<WeightScreen />);

  await waitFor(() => expect(screen.getByText('최근 6개월 +0.3kg')).toBeTruthy());
  // "현재" 요약 카드와 목록의 오늘 기록 행 양쪽에 같은 체중이 보인다.
  expect(screen.getAllByText('4.3kg')).toHaveLength(2);

  await fireEvent.press(screen.getByText('4kg'));
  expect(mockPush).toHaveBeenCalledWith(`/pets/pet-two/weight/${first.id}`);
});
