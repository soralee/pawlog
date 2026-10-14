import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { addDays, format, parseISO } from 'date-fns';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import ScheduleScreen from '@/app/(tabs)/schedule';
import { createCheckupRepository, type CheckupDb } from '@/db/repositories/checkup.repository';
import {
  createMedicationRepository,
  type MedicationDb,
} from '@/db/repositories/medication.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
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

test('일정이 없으면 EmptyState가 뜨고, 펫이 한 마리면 펫 선택 없이 바로 일정 추가 시트가 열린다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await render(<ScheduleScreen />);

  expect(await screen.findByText('다가오는 일정이 없어요.')).toBeTruthy();
  // 펫이 한 마리뿐이므로 펫 필터 Chip은 보이지 않는다(Graceful Mode).
  expect(screen.queryByLabelText('반려동물 전체')).toBeNull();

  await fireEvent.press(screen.getByLabelText('일정 추가하기'));
  await fireEvent.press(await screen.findByLabelText('예방접종 일정'));

  expect(mockPush).toHaveBeenCalledWith(`/pets/${pet.id}/vaccination/new-schedule`);
});

test('펫이 2마리 이상이면 펫 필터로 좁혀지고, 접종/검진 필터와 월/일 그룹으로 보인다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '뭉치',
    birthDate: '2019-03-01',
    species: 'dog',
    gender: 'male',
  });

  const today = parseISO(todayDateString());
  const vaccinationDue = format(addDays(today, 5), 'yyyy-MM-dd');
  const checkupDue = format(addDays(today, 10), 'yyyy-MM-dd');

  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '종합백신',
    nextDueAt: vaccinationDue,
  });
  const checkupRepo = createCheckupRepository(mockDbInstance! as unknown as CheckupDb);
  await checkupRepo.create({
    petId: pet.id,
    checkupType: '심장 검진',
    nextDueAt: checkupDue,
  });

  await render(<ScheduleScreen />);

  // 펫이 2마리(보리/뭉치)이므로 펫 필터 Chip이 보이고, 뭉치로 좁혀서 본다.
  await fireEvent.press(await screen.findByLabelText('뭉치 필터'));

  await waitFor(() => expect(screen.getByText('종합백신')).toBeTruthy());
  expect(screen.getByText('심장 검진')).toBeTruthy();
  expect(screen.getByText('D-5')).toBeTruthy();
  expect(screen.getByText('D-10')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('검진'));

  expect(screen.getByText('심장 검진')).toBeTruthy();
  expect(screen.queryByText('종합백신')).toBeNull();
});

test('"전체" 보기에서는 Row에 펫 태그가 붙고, "+"를 누르면 펫 선택 시트가 먼저 뜬다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pets = await petRepository.listPets();
  const mungchi = pets.find((p) => p.name === '뭉치')!;

  await render(<ScheduleScreen />);

  // 기본 필터는 "전체"이므로 이전 테스트에서 만든 뭉치의 일정에 펫 태그가 붙어 보인다.
  await waitFor(() => expect(screen.getByText('[뭉치] 종합백신')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('일정 추가'));
  await fireEvent.press(await screen.findByLabelText('뭉치'));
  await fireEvent.press(await screen.findByLabelText('건강검진 일정'));

  expect(mockPush).toHaveBeenCalledWith(`/pets/${mungchi.id}/checkup/new-schedule`);
});

test('활성 복약은 "오늘의 복약"에 보이고, "복약" 필터는 접종/검진을 숨긴다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pets = await petRepository.listPets();
  const mungchi = pets.find((p) => p.name === '뭉치')!;

  const medicationRepo = createMedicationRepository(mockDbInstance! as unknown as MedicationDb);
  await medicationRepo.create({
    petId: mungchi.id,
    name: '영양제',
    startDate: '2026-01-01',
    time: '21:00',
    frequency: '매일',
  });

  await render(<ScheduleScreen />);

  await waitFor(() => expect(screen.getByText('[뭉치] 영양제')).toBeTruthy());
  expect(screen.getByText('매일 21:00')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('복약'));

  expect(screen.getByText('[뭉치] 영양제')).toBeTruthy();
  expect(screen.queryByText('[뭉치] 종합백신')).toBeNull();
});

test('일정 추가 시트에서 "복약 일정"을 고르면 복약 등록 화면으로 이동한다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pets = await petRepository.listPets();
  const bori = pets.find((p) => p.name === '보리')!;

  await render(<ScheduleScreen />);

  await fireEvent.press(screen.getByLabelText('일정 추가'));
  await fireEvent.press(await screen.findByLabelText('보리'));
  await fireEvent.press(await screen.findByLabelText('복약 일정'));

  expect(mockPush).toHaveBeenCalledWith(`/pets/${bori.id}/medication/new`);
});

test('지난 일정은 D-day Chip 대신 "N일 지남" 텍스트로 표시한다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '초코',
    birthDate: '2021-05-01',
    species: 'cat',
    gender: 'female',
  });

  const overdueDate = format(addDays(parseISO(todayDateString()), -5), 'yyyy-MM-dd');
  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '광견병',
    nextDueAt: overdueDate,
  });

  await render(<ScheduleScreen />);

  await fireEvent.press(await screen.findByLabelText('초코 필터'));

  expect(await screen.findByText('지난 일정')).toBeTruthy();
  expect(screen.getByText(`${overdueDate} · 5일 지남`)).toBeTruthy();
  expect(screen.queryByText('D+5')).toBeNull();
  expect(screen.queryByText('D-5')).toBeNull();
});
