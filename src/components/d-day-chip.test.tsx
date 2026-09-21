import { render, screen } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';

import { DDayChip } from './d-day-chip';

test.each([
  [14, 'D-14'],
  [0, '오늘'],
  [-2, 'D+2'],
  ['done' as const, '완료'],
])('daysUntil=%p이면 "%s"로 표시된다', async (daysUntil, expected) => {
  await render(<DDayChip daysUntil={daysUntil} />);
  expect(screen.getByText(expected)).toBeTruthy();
});

test('임박(3일 이하)이 아닌 다가오는 일정은 Primary(Coral) 색상이다', async () => {
  await render(<DDayChip daysUntil={14} />);
  expect(screen.getByText('D-14')).toHaveStyle({ color: Colors.light.primary });
});

test('임박(3일 이하)한 일정은 Warning 색상이다', async () => {
  await render(<DDayChip daysUntil={2} />);
  expect(screen.getByText('D-2')).toHaveStyle({ color: Colors.light.warning });
});

test('완료된 일정은 Success 색상이다', async () => {
  await render(<DDayChip daysUntil="done" />);
  expect(screen.getByText('완료')).toHaveStyle({ color: Colors.light.success });
});
