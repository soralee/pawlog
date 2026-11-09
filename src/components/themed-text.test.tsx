import { render, screen } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';

import { ThemedText } from './themed-text';

test('linkPrimary는 하드코딩된 파란색 대신 Colors.light.primary 토큰을 사용한다', async () => {
  await render(<ThemedText type="linkPrimary">링크</ThemedText>);
  expect(screen.getByText('링크')).toHaveStyle({ color: Colors.light.primary });
});
