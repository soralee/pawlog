import { render, screen } from '@testing-library/react-native';

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
