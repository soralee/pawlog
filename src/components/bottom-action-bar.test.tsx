import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { BottomActionBar } from './bottom-action-bar';

test('BottomActionBar는 Safe Area bottomInset과 divider 테두리를 적용해 자식을 렌더한다', async () => {
  await render(
    <BottomActionBar bottomInset={20} testID="bottom-cta">
      <Text>기록 추가하기</Text>
    </BottomActionBar>,
  );

  expect(screen.getByText('기록 추가하기')).toBeTruthy();
  expect(screen.getByTestId('bottom-cta')).toHaveStyle({
    backgroundColor: Colors.light.surface,
    borderTopColor: Colors.light.divider,
    paddingBottom: Spacing.sm + 20,
  });
});
