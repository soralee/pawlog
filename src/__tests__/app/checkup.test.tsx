import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewCheckupScreen from '@/app/pets/[petId]/checkup/new';
import NewCheckupScheduleScreen from '@/app/pets/[petId]/checkup/new-schedule';
import CheckupDetailScreen from '@/app/pets/[petId]/checkup/[id]';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import { todayDateString } from '@/utils/date';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

const mockBack = jest.fn();
let mockParamId = 'record-1';
const mockPetId = 'pet-1';
jest.mock('expo-router', () => ({
  // 헤더 우측의 "수정" Text Action(options.headerRight)도 테스트에서 누를 수 있어야 한다.
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight ? options.headerRight() : null,
  },
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: mockParamId, petId: mockPetId }),
}));

test('기록 등록 화면 — 미래 날짜는 거부하고, 통과하면 완료 기록으로 저장된다', async () => {
  mockBack.mockClear();

  await render(<NewCheckupScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('검진 종류를 입력해주세요')).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('검진 종류'), '종합검진');
  await fireEvent.changeText(screen.getByLabelText('실제 검진일'), '2099-01-01');
  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText(/미래 날짜는 기록으로 저장할 수 없어요/)).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('실제 검진일'), todayDateString());
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.checkupType)).toEqual(['종합검진']);
});

test('일정 등록 화면 — 예정일만 받아 미완료 일정으로 저장된다', async () => {
  mockBack.mockClear();

  await render(<NewCheckupScheduleScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('검진 종류를 입력해주세요')).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('검진 종류'), '심장 검진');
  await fireEvent.changeText(screen.getByLabelText('예정일'), '2026-12-25');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  const list = await repository.listByPet('pet-1');
  const created = list.find((r) => r.checkupType === '심장 검진');
  expect(created?.checkedAt).toBeNull();
  expect(created?.nextDueAt).toBe('2026-12-25');
});

test('상세 화면 — 완료 기록을 불러오고, 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
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

test('상세 화면 — 미완료 일정을 "완료하기"로 완료 기록으로 전환한다', async () => {
  const repository = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  const created = await repository.create({
    petId: 'pet-1',
    checkupType: '심장 검진',
    nextDueAt: '2026-12-25',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<CheckupDetailScreen />);

  expect(await screen.findByText('예정일 2026-12-25')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('완료하기'));
  // 실제 검진일은 예정일을 기본값으로 보여주고 사용자가 확인/수정할 수 있어야 한다.
  expect(screen.getByLabelText('실제 검진일').props.value).toBe('2026-12-25');
  await fireEvent.press(screen.getByLabelText('완료하고 기록하기'));

  expect(await screen.findByText('검진일 2026-12-25')).toBeTruthy();
  const updated = await repository.get(created.id);
  expect(updated?.checkedAt).toBe('2026-12-25');
});
