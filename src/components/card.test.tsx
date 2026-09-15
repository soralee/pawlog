import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Card } from './card';

test('children을 감싸서 렌더한다', async () => {
  await render(
    <Card>
      <Text>내용</Text>
    </Card>,
  );
  expect(screen.getByText('내용')).toBeTruthy();
});
