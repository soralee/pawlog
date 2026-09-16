import { daysUntil, formatAge, isValidDateString } from './date';

test('formatAge returns years and months', () => {
  const now = new Date('2026-09-15');
  expect(formatAge(new Date('2018-06-15'), now)).toBe('8살 3개월');
});

test('formatAge returns months only for under 1 year', () => {
  const now = new Date('2026-09-15');
  expect(formatAge(new Date('2026-03-15'), now)).toBe('6개월');
});

test('isValidDateString accepts real YYYY-MM-DD dates', () => {
  expect(isValidDateString('2026-09-15')).toBe(true);
  expect(isValidDateString('2024-02-29')).toBe(true); // 윤년
});

test('isValidDateString rejects malformed or non-existent dates', () => {
  expect(isValidDateString('2026-13-01')).toBe(false); // 존재하지 않는 달
  expect(isValidDateString('2026-02-30')).toBe(false); // 2월엔 30일이 없음
  expect(isValidDateString('2023-02-29')).toBe(false); // 평년
  expect(isValidDateString('2026-9-15')).toBe(false); // 자리수 다름
  expect(isValidDateString('아무말')).toBe(false);
  expect(isValidDateString('')).toBe(false);
});

test('daysUntil returns positive days for a future date', () => {
  expect(daysUntil('2026-09-28', '2026-09-14')).toBe(14);
});

test('daysUntil returns 0 for today', () => {
  expect(daysUntil('2026-09-14', '2026-09-14')).toBe(0);
});

test('daysUntil returns negative days for a past date', () => {
  expect(daysUntil('2026-09-10', '2026-09-14')).toBe(-4);
});
