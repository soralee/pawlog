import { fireEvent, render, screen } from '@testing-library/react-native';

import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import NewVaccinationScreen from '@/app/pets/[petId]/vaccination/new';
import NewVaccinationScheduleScreen from '@/app/pets/[petId]/vaccination/new-schedule';
import VaccinationDetailScreen from '@/app/pets/[petId]/vaccination/[id]';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
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

  await render(<NewVaccinationScreen />);

  await fireEvent.changeText(screen.getByLabelText('백신 이름'), '종합백신');
  await fireEvent.changeText(screen.getByLabelText('실제 접종일'), '2026-13-40');
  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요')).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('실제 접종일'), '2099-01-01');
  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText(/미래 날짜는 기록으로 저장할 수 없어요/)).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('실제 접종일'), todayDateString());
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  const list = await repository.listByPet('pet-1');
  expect(list.map((r) => r.vaccineName)).toEqual(['종합백신']);
  expect(list[0].vaccinatedAt).toBe(todayDateString());
});

test('일정 등록 화면 — 예정일만 받아 미완료 일정으로 저장된다', async () => {
  mockBack.mockClear();

  await render(<NewVaccinationScheduleScreen />);

  await fireEvent.press(screen.getByLabelText('저장하기'));
  expect(await screen.findByText('백신 이름을 입력해주세요')).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('백신 이름'), '광견병');
  await fireEvent.changeText(screen.getByLabelText('예정일'), '2026-12-25');
  await fireEvent.press(screen.getByLabelText('저장하기'));

  expect(mockBack).toHaveBeenCalledTimes(1);
  const repository = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  const list = await repository.listByPet('pet-1');
  const created = list.find((r) => r.vaccineName === '광견병');
  expect(created?.vaccinatedAt).toBeNull();
  expect(created?.nextDueAt).toBe('2026-12-25');
});

test('상세 화면 — 완료 기록을 불러오고, 수정하고, 삭제 확인 다이얼로그를 거쳐 삭제한다', async () => {
  const repository = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  const created = await repository.create({
    petId: 'pet-1',
    vaccineName: '종합백신',
    vaccinatedAt: '2026-09-01',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<VaccinationDetailScreen />);

  expect(await screen.findByText('종합백신')).toBeTruthy();

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
  const repository = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  const created = await repository.create({
    petId: 'pet-1',
    vaccineName: '종합백신',
    nextDueAt: '2026-12-25',
  });
  mockParamId = created.id;
  mockBack.mockClear();

  await render(<VaccinationDetailScreen />);

  expect(await screen.findByText('예정일 2026-12-25')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('완료하기'));
  // 실제 접종일은 예정일을 기본값으로 보여주고 사용자가 확인/수정할 수 있어야 한다.
  expect(screen.getByLabelText('실제 접종일').props.value).toBe('2026-12-25');
  await fireEvent.press(screen.getByLabelText('완료하고 기록하기'));

  expect(await screen.findByText('접종일 2026-12-25')).toBeTruthy();
  const updated = await repository.get(created.id);
  expect(updated?.vaccinatedAt).toBe('2026-12-25');
});
