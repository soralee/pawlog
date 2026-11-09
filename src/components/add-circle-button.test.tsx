import { fireEvent, render, screen } from '@testing-library/react-native';

import { AddCircleButton } from './add-circle-button';

test('AddCircleButton은 접근성 라벨로 렌더되고 누르면 onPress가 호출된다', async () => {
  const onPress = jest.fn();
  await render(<AddCircleButton accessibilityLabel="일정 추가" onPress={onPress} />);

  await fireEvent.press(screen.getByLabelText('일정 추가'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
