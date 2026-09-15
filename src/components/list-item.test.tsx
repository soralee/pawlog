import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ListItem } from './list-item';

test('제목·부가정보·trailing을 렌더한다', async () => {
  await render(
    <ListItem title="건강검진" subtitle="9월 3일 · OO동물병원" trailing={<Text>{'>'}</Text>} />,
  );
  expect(screen.getByText('건강검진')).toBeTruthy();
  expect(screen.getByText('9월 3일 · OO동물병원')).toBeTruthy();
  expect(screen.getByText('>')).toBeTruthy();
});

test('onPress가 있으면 눌렀을 때 호출된다', async () => {
  const onPress = jest.fn();
  await render(<ListItem title="건강검진" onPress={onPress} />);
  await fireEvent.press(screen.getByLabelText('건강검진'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
