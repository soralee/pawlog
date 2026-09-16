import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';
import { useEffect as mockUseEffect } from 'react';

import RecordsScreen from '@/app/(tabs)/records';
import {
  createHealthRecordRepository,
  type HealthRecordDb,
} from '@/db/repositories/health-record.repository';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import {
  createVaccinationRepository,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
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
  useRouter: () => ({ push: mockPush }),
  // 테스트 환경에는 실제 네비게이션 포커스 이벤트가 없으므로, 콜백이 바뀔 때 실행되는
  // useEffect로 대체해 "포커스될 때 다시 불러온다"는 동작을 흉내낸다.
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));

// 같은 파일에서 render()를 여러 번 호출하므로, 이전 테스트의 트리를 정리하지 않으면
// act() 스코프가 겹치면서 이후 테스트의 상태 업데이트가 유실될 수 있다.
afterEach(cleanup);

test('반려동물이 없으면 안내 문구가 뜬다', async () => {
  await render(<RecordsScreen />);
  expect(
    await screen.findByText('먼저 "내 반려동물" 탭에서 반려동물을 등록해주세요.'),
  ).toBeTruthy();
});

test('기록이 없으면 EmptyState가 뜨고, CTA를 누르면 기록 종류 선택 시트가 열린다', async () => {
  useAppStore.setState({ selectedPetId: null });
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await render(<RecordsScreen />);

  expect(await screen.findByText('아직 건강 기록이 없어요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('첫 기록 남기기'));
  await fireEvent.press(await screen.findByLabelText('건강 기록'));

  expect(mockPush).toHaveBeenCalledWith('/health-record/new');
});

test('여러 종류의 기록이 필터로 좁혀지고, 최신 월부터 그룹으로 보인다', async () => {
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  const pet = await petRepository.createPet({
    name: '뭉치',
    birthDate: '2019-03-01',
    species: 'dog',
    gender: 'male',
  });
  // 다른 테스트가 만든 펫이 fake db에 이미 있을 수 있어(첫 번째 펫 자동 선택 로직과
  // 무관하게) 이 테스트가 만든 펫을 명시적으로 선택한다.
  useAppStore.setState({ selectedPetId: pet.id });

  const healthRepo = createHealthRecordRepository(mockDbInstance! as unknown as HealthRecordDb);
  await healthRepo.create({ petId: pet.id, recordedAt: '2026-08-10', note: '구토함' });
  const vaccinationRepo = createVaccinationRepository(mockDbInstance! as unknown as VaccinationDb);
  await vaccinationRepo.create({
    petId: pet.id,
    vaccineName: '종합백신',
    vaccinatedAt: '2026-09-03',
  });

  await render(<RecordsScreen />);

  await waitFor(() => expect(screen.getByText('종합백신')).toBeTruthy());
  expect(screen.getByText('건강 기록')).toBeTruthy();
  expect(screen.getByText('2026년 9월')).toBeTruthy();
  expect(screen.getByText('2026년 8월')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('접종'));

  expect(screen.getByText('종합백신')).toBeTruthy();
  expect(screen.queryByText('건강 기록')).toBeNull();
});
