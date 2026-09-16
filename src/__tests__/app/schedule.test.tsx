import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { addDays, format, parseISO } from 'date-fns';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import ScheduleScreen from '@/app/(tabs)/schedule';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
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
  useRouter: () => ({ push: mockPush }),
  // 테스트 환경에는 실제 네비게이션 포커스 이벤트가 없으므로, 콜백이 바뀔 때 실행되는
  // useEffect로 대체해 "포커스될 때 다시 불러온다"는 동작을 흉내낸다.
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));

afterEach(cleanup);

test('반려동물이 없으면 안내 문구가 뜬다', async () => {
  await render(<ScheduleScreen />);
  expect(
    await screen.findByText('먼저 "내 반려동물" 탭에서 반려동물을 등록해주세요.'),
  ).toBeTruthy();
});

test('일정이 없으면 EmptyState가 뜨고, CTA를 누르면 일정 추가 시트가 열린다', async () => {
  useAppStore.setState({ selectedPetId: null });
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await render(<ScheduleScreen />);

  expect(await screen.findByText('다가오는 일정이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('일정 추가하기'));
  await fireEvent.press(await screen.findByLabelText('예방접종'));

  expect(mockPush).toHaveBeenCalledWith('/vaccination/new');
});

test('접종/검진 일정이 필터로 좁혀지고 월/일 그룹으로 보인다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '뭉치',
    birthDate: '2019-03-01',
    species: 'dog',
    gender: 'male',
  });
  // 다른 테스트가 만든 펫이 fake db에 이미 있을 수 있어 이 테스트가 만든 펫을 명시적으로 선택한다.
  useAppStore.setState({ selectedPetId: pet.id });

  const today = parseISO(todayDateString());
  const vaccinationDue = format(addDays(today, 5), 'yyyy-MM-dd');
  const checkupDue = format(addDays(today, 10), 'yyyy-MM-dd');

  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '종합백신',
    vaccinatedAt: todayDateString(),
    nextDueAt: vaccinationDue,
  });
  const checkupRepo = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  await checkupRepo.create({
    petId: pet.id,
    checkupType: '심장 검진',
    checkedAt: todayDateString(),
    nextDueAt: checkupDue,
  });

  await render(<ScheduleScreen />);

  await waitFor(() => expect(screen.getByText('종합백신')).toBeTruthy());
  expect(screen.getByText('심장 검진')).toBeTruthy();
  expect(screen.getByText('D-5')).toBeTruthy();
  expect(screen.getByText('D-10')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('검진'));

  expect(screen.getByText('심장 검진')).toBeTruthy();
  expect(screen.queryByText('종합백신')).toBeNull();
});
