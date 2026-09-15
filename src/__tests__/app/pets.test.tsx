import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

// jest.mock 팩토리는 호이스팅되어 "mock"으로 시작하는 이름의 외부 변수만 참조할 수 있다.
// 실제 SQLiteProvider처럼 렌더마다 같은 db 인스턴스를 돌려주도록 첫 호출 때 한 번만 만든다
// (매번 새로 만들면 등록 직후 재렌더 때 데이터가 든 db가 아니라 빈 db를 보게 된다).
import { createFakeSqliteDatabase as mockCreateFakeSqliteDatabase } from '@/db/testing/fake-sqlite-database';

import PetsScreen from '@/app/pets';

let mockDbInstance: ReturnType<typeof mockCreateFakeSqliteDatabase> | null = null;
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => {
    if (!mockDbInstance) mockDbInstance = mockCreateFakeSqliteDatabase();
    return mockDbInstance;
  },
}));

test('반려동물을 등록하면 목록에 나타난다', async () => {
  await render(<PetsScreen />);

  expect(await screen.findByText('등록된 반려동물이 없어요.')).toBeTruthy();

  fireEvent.changeText(screen.getByLabelText('이름'), '보리');
  fireEvent.changeText(screen.getByLabelText('생년월일'), '2018-06-15');
  fireEvent.press(screen.getByLabelText('등록'));

  await waitFor(() => expect(screen.getByText('보리')).toBeTruthy());
});
