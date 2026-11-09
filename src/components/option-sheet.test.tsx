import { fireEvent, render, screen } from '@testing-library/react-native';

import { Colors, IconTileTone } from '@/constants/theme';

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
      options={[{ label: '건강 기록', icon: 'document-text-outline', onPress }]}
      onClose={onClose}
    />,
  );

  expect(screen.getByTestId('option-sheet-grabber')).toBeTruthy();
  expect(screen.getByText('어떤 기록을 남길까요?')).toBeTruthy();
  expect(screen.getByTestId('option-icon-document-text-outline')).toHaveStyle({
    color: Colors.light.primary,
  });
  expect(screen.getByTestId('option-chevron-건강 기록')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('건강 기록'));

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('옵션별 iconTone 또는 iconColor가 지정되면 해당 도메인 색으로 아이콘을 렌더한다', async () => {
  await render(
    <OptionSheet
      visible
      title="어떤 기록을 남길까요?"
      options={[
        {
          label: '예방접종',
          icon: 'medkit-outline',
          iconTone: 'info',
          onPress: () => {},
        },
        {
          label: '건강검진',
          icon: 'heart-outline',
          iconColor: IconTileTone.success.color,
          onPress: () => {},
        },
      ]}
      onClose={() => {}}
    />,
  );

  expect(screen.getByTestId('option-icon-medkit-outline')).toHaveStyle({
    color: IconTileTone.info.color,
  });
  expect(screen.getByTestId('option-icon-heart-outline')).toHaveStyle({
    color: IconTileTone.success.color,
  });
});
