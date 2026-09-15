import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState } from './empty-state';

test('제목·설명을 렌더하고, CTA가 있으면 누를 수 있다', async () => {
  const onPressCta = jest.fn();
  await render(
    <EmptyState
      title="아직 건강 기록이 없어요."
      description="오늘부터 하나씩 기록해 보세요."
      ctaLabel="첫 기록 남기기"
      onPressCta={onPressCta}
    />,
  );

  expect(screen.getByText('아직 건강 기록이 없어요.')).toBeTruthy();
  expect(screen.getByText('오늘부터 하나씩 기록해 보세요.')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('첫 기록 남기기'));
  expect(onPressCta).toHaveBeenCalledTimes(1);
});

test('CTA 없이도 렌더된다', async () => {
  await render(<EmptyState title="일정이 없어요." />);
  expect(screen.getByText('일정이 없어요.')).toBeTruthy();
});
