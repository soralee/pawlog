import { formatAge } from './date';

test('formatAge returns years and months', () => {
  const now = new Date('2026-09-15');
  expect(formatAge(new Date('2018-06-15'), now)).toBe('8살 3개월');
});

test('formatAge returns months only for under 1 year', () => {
  const now = new Date('2026-09-15');
  expect(formatAge(new Date('2026-03-15'), now)).toBe('6개월');
});
