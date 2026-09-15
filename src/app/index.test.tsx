import { render, screen } from '@testing-library/react-native';

import HomeScreen from './index';

test('renders the home screen title', async () => {
  await render(<HomeScreen />);
  expect(screen.getByText('홈')).toBeTruthy();
});
