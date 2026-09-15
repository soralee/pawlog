import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
// 렌더마다 같은 db 인스턴스를 돌려주도록 첫 호출 때 한 번만 만든다 (pets.test.tsx와 동일한 이유).
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import RecordsScreen from '@/app/records';
import { createPetRepository, type PetDb } from '@/db/repositories/pet.repository';
import { useAppStore } from '@/stores/app.store';
import { todayDateString } from '@/utils/date';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
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

test('반려동물이 있으면 자동 선택되고, 기록을 추가하면 목록에 나타난다', async () => {
  useAppStore.setState({ selectedPetId: null });
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  await petRepository.createPet({
    name: '보리',
    birthDate: '2018-06-15',
    species: 'dog',
    gender: 'male',
  });

  await render(<RecordsScreen />);

  expect(await screen.findByText('건강 기록이 없어요.')).toBeTruthy();

  // @testing-library/react-native 14는 fireEvent.*가 Promise를 반환한다 — await 없이 연달아
  // 호출하면 상태 업데이트가 겹쳐 유실될 수 있다.
  await fireEvent.changeText(screen.getByLabelText('건강 기록 메모'), '아침에 사료를 잘 먹었다');
  await fireEvent.press(screen.getByLabelText('건강 기록 추가'));

  expect(screen.getByLabelText('기록 날짜').props.value).toBe(todayDateString());

  await waitFor(() => expect(screen.getByText('아침에 사료를 잘 먹었다')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('아침에 사료를 잘 먹었다 삭제'));

  await waitFor(() => expect(screen.getByText('건강 기록이 없어요.')).toBeTruthy());
});

test('기록 날짜는 오늘 날짜가 기본값이지만 자유롭게 바꿀 수 있다', async () => {
  useAppStore.setState({ selectedPetId: null });
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  await petRepository.createPet({
    name: '뭉치',
    birthDate: '2019-03-01',
    species: 'dog',
    gender: 'male',
  });

  await render(<RecordsScreen />);
  await screen.findByText('건강 기록이 없어요.');

  await fireEvent.changeText(screen.getByLabelText('건강 기록 메모'), '건강검진 다녀옴');
  await fireEvent.changeText(screen.getByLabelText('기록 날짜'), '2026-01-05');
  await fireEvent.press(screen.getByLabelText('건강 기록 추가'));

  await waitFor(() => expect(screen.getByText('2026-01-05')).toBeTruthy());
});

test('예방접종의 다음 예정일에 존재하지 않는 날짜를 넣으면 저장되지 않는다', async () => {
  useAppStore.setState({ selectedPetId: null });
  const petRepository = createPetRepository(mockDbInstance! as unknown as PetDb);
  await petRepository.createPet({
    name: '나비',
    birthDate: '2020-01-01',
    species: 'cat',
    gender: 'female',
  });

  await render(<RecordsScreen />);
  await fireEvent.press(await screen.findByLabelText('예방접종'));

  await fireEvent.changeText(screen.getByLabelText('백신 이름'), '광견병');
  await fireEvent.changeText(screen.getByLabelText('다음 접종 예정일'), '2026-13-40');
  await fireEvent.press(screen.getByLabelText('예방접종 추가'));

  expect(await screen.findByText('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요')).toBeTruthy();
  expect(screen.queryByText('광견병')).toBeNull();

  await fireEvent.changeText(screen.getByLabelText('다음 접종 예정일'), '2027-01-15');
  await fireEvent.press(screen.getByLabelText('예방접종 추가'));

  await waitFor(() => expect(screen.getByText('광견병')).toBeTruthy());
});
