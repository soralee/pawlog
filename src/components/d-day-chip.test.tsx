import { render, screen } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';

import { DDayChip } from './d-day-chip';

test.each([
  [45, 'D-45'],
  [14, 'D-14'],
  [7, 'D-7'],
  [0, '오늘'],
  [-2, '2일 지남'],
  ['done' as const, '완료'],
])('daysUntil=%p이면 "%s"로 표시된다', async (daysUntil, expected) => {
  await render(<DDayChip daysUntil={daysUntil} />);
  expect(screen.getByText(expected)).toBeTruthy();
});

test('0~7일은 Warning 대비쌍(warningBg + warningText)을 사용한다', async () => {
  await render(<DDayChip daysUntil={7} />);
  expect(screen.getByText('D-7')).toHaveStyle({ color: Colors.light.warningText });
  expect(screen.getByTestId('d-day-chip')).toHaveStyle({
    backgroundColor: Colors.light.warningBg,
  });
});

test('surfaceTone="primaryLight"일 때 Warning 상태는 Primary Light 배경과 warningText 테두리·글자를 사용한다', async () => {
  await render(<DDayChip daysUntil={5} surfaceTone="primaryLight" />);
  expect(screen.getByText('D-5')).toHaveStyle({ color: Colors.light.warningText });
  expect(screen.getByTestId('d-day-chip')).toHaveStyle({
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.warningText,
    borderWidth: 1,
  });
});

test('8~30일은 Primary(Coral) 색상이다', async () => {
  await render(<DDayChip daysUntil={14} />);
  expect(screen.getByText('D-14')).toHaveStyle({ color: Colors.light.primary });
});

test('31일 이상은 Info 색상이다', async () => {
  await render(<DDayChip daysUntil={45} />);
  expect(screen.getByText('D-45')).toHaveStyle({ color: Colors.light.info });
});

test('완료된 일정(daysUntil="done" 또는 status="completed")은 Success 색상이다', async () => {
  await render(<DDayChip daysUntil={10} status="completed" />);
  expect(screen.getByText('완료')).toHaveStyle({ color: Colors.light.success });
});
