import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

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

test('leadingText와 trailingText를 함께 렌더한다', async () => {
  await render(<ListItem title="종합백신" leadingText="09.03" trailingText="4.3kg" />);
  expect(screen.getByText('09.03')).toBeTruthy();
  expect(screen.getByText('종합백신')).toBeTruthy();
  expect(screen.getByText('4.3kg')).toBeTruthy();
});

test('텍스트 그룹은 배경색을 칠하지 않는다(§2.26 O3)', async () => {
  await render(<ListItem title="영양제" subtitle="오후 9:00" />);

  const group = screen.getByTestId('list-item-text-group');
  const flat = StyleSheet.flatten(group.props.style);
  expect(flat.backgroundColor).toBeUndefined();
});
