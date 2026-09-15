import { fireEvent, render, screen } from '@testing-library/react-native';

import { OptionSheet } from './option-sheet';

test('visible이 false면 옵션이 안 보인다', async () => {
  await render(
    <OptionSheet
      visible={false}
      options={[{ label: '건강 기록', onPress: () => {} }]}
      onClose={() => {}}
    />,
  );
  expect(screen.queryByText('건강 기록')).toBeNull();
});

test('옵션을 누르면 onPress와 onClose가 모두 호출된다', async () => {
  const onPress = jest.fn();
  const onClose = jest.fn();
  await render(
    <OptionSheet
      visible
      title="어떤 기록을 남길까요?"
      options={[{ label: '건강 기록', onPress }]}
      onClose={onClose}
    />,
  );

  expect(screen.getByText('어떤 기록을 남길까요?')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('건강 기록'));

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledTimes(1);
});
