import { fireEvent, render, screen } from '@testing-library/react-native';

import { Input } from './input';

test('라벨은 항상 보이고, 선택 필드는 "(선택)"이 붙는다', async () => {
  await render(<Input label="이름" value="" onChangeText={() => {}} />);
  expect(screen.getByText('이름')).toBeTruthy();

  await render(<Input label="병원명" optional value="" onChangeText={() => {}} />);
  expect(screen.getByText('병원명 (선택)')).toBeTruthy();
});

test('입력하면 onChangeText가 호출된다', async () => {
  const onChangeText = jest.fn();
  await render(<Input label="이름" value="" onChangeText={onChangeText} />);

  await fireEvent.changeText(screen.getByLabelText('이름'), '보리');
  expect(onChangeText).toHaveBeenCalledWith('보리');
});

test('error가 있으면 입력창 아래에 표시된다', async () => {
  await render(<Input label="이름" value="" onChangeText={() => {}} error="이름을 입력해주세요" />);
  expect(screen.getByText('이름을 입력해주세요')).toBeTruthy();
});
