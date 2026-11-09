import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors, Elevation } from '@/constants/theme';

import { Card } from './card';

test('children을 감싸서 렌더하고 Elevation.card 그림자와 테두리를 적용한다', async () => {
  await render(
    <Card testID="card">
      <Text>내용</Text>
    </Card>,
  );
  expect(screen.getByText('내용')).toBeTruthy();
  expect(screen.getByTestId('card')).toHaveStyle({
    borderColor: Colors.light.border,
    ...Elevation.card,
  });
});
