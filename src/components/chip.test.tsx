import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChipTokens, Colors } from '@/constants/theme';

import { Chip } from './chip';

test('filter chip은 선택 여부에 따라 색상과 accessibilityState.selected가 반영된다', async () => {
  const onPress = jest.fn();
  await render(
    <>
      <Chip label="전체" selected onPress={onPress} />
      <Chip label="예방접종" selected={false} onPress={onPress} />
    </>,
  );

  expect(screen.getByText('전체')).toHaveStyle({ color: ChipTokens.filterSelected.color });
  expect(screen.getByText('예방접종')).toHaveStyle({ color: ChipTokens.filterUnselected.color });
  expect(screen.getByLabelText('전체').props.accessibilityState).toMatchObject({ selected: true });
  expect(screen.getByLabelText('예방접종').props.accessibilityState).toMatchObject({
    selected: false,
  });

  await fireEvent.press(screen.getByLabelText('예방접종'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('status chip tone="warning" 라벨은 warningText 전경색을 쓴다', async () => {
  await render(<Chip label="주의" variant="status" tone="warning" />);
  expect(screen.getByText('주의')).toHaveStyle({ color: Colors.light.warningText });
});
