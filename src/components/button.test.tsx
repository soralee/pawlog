import { fireEvent, render, screen } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';

import { Button } from './button';

test('각 variant가 라벨과 함께 렌더되고 스펙 색상을 사용한다', async () => {
  await render(
    <>
      <Button variant="primary" onPress={() => {}}>
        Primary
      </Button>
      <Button variant="secondary" onPress={() => {}}>
        Secondary
      </Button>
      <Button variant="text" onPress={() => {}}>
        Text
      </Button>
      <Button variant="destructive" onPress={() => {}}>
        Destructive
      </Button>
    </>,
  );

  expect(screen.getByText('Primary')).toHaveStyle({ color: Colors.light.onPrimary });
  expect(screen.getByText('Secondary')).toHaveStyle({ color: Colors.light.primary });
  expect(screen.getByLabelText('Secondary')).toHaveStyle({
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  });
  expect(screen.getByText('Text')).toHaveStyle({ color: Colors.light.primary });
  expect(screen.getByText('Destructive')).toHaveStyle({ color: Colors.light.onPrimary });
});

test('누르면 onPress가 호출된다', async () => {
  const onPress = jest.fn();
  await render(
    <Button variant="primary" onPress={onPress}>
      저장
    </Button>,
  );

  await fireEvent.press(screen.getByLabelText('저장'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('disabled면 onPress가 호출되지 않는다', async () => {
  const onPress = jest.fn();
  await render(
    <Button variant="primary" onPress={onPress} disabled>
      저장
    </Button>,
  );

  await fireEvent.press(screen.getByLabelText('저장'));
  expect(onPress).not.toHaveBeenCalled();
});
