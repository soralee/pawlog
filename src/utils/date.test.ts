import {
  daysUntil,
  formatAge,
  formatAgeFromDateString,
  formatDateForDisplay,
  formatDDay,
  formatOverdueScheduleDays,
  formatTimeForDisplay,
  isValidDateString,
  todayDateString,
} from './date';

test('formatAge returns years and months', () => {
  const now = new Date('2026-09-15');
  expect(formatAge(new Date('2018-06-15'), now)).toBe('8살 3개월');
});

test('formatAge returns months only for under 1 year', () => {
  const now = new Date('2026-09-15');
  expect(formatAge(new Date('2026-03-15'), now)).toBe('6개월');
});

test('formatAge rejects a future birth date instead of producing a negative age', () => {
  expect(formatAge(new Date('2027-01-01'), new Date('2026-01-01'))).toBe('');
});

test.each(['', 'not-a-date', '2027-01-01'])('formatAgeFromDateString rejects %s', (date) => {
  jest.useFakeTimers().setSystemTime(new Date('2026-06-01T12:00:00'));
  expect(formatAgeFromDateString(date)).toBe('');
  jest.useRealTimers();
});

test('formatAgeFromDateString parses a local date string', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-09-15T12:00:00'));
  expect(formatAgeFromDateString('2026-03-15')).toBe('6개월');
  jest.useRealTimers();
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

test('daysUntil returns null for invalid date inputs', () => {
  expect(daysUntil('bad', '2026-09-14')).toBeNull();
  expect(daysUntil('2026-09-14', 'bad')).toBeNull();
});

test('formatDDay describes overdue dates in Korean', () => {
  expect(formatDDay(-3)).toBe('3일 지남');
});

test.each([
  ['2026-06-01T00:30:00.000Z', '2026-06-01'],
  ['2026-06-01T15:30:00.000Z', '2026-06-02'],
])('todayDateString uses local date around Korean midnight: %s', (iso, expected) => {
  jest.useFakeTimers().setSystemTime(new Date(iso));
  expect(todayDateString()).toBe(expected);
  jest.useRealTimers();
});

test.each([
  ['schedule', '2025-09-28', undefined, '2025년 9월 28일 (일)'],
  ['schedule', '2026-01-04', undefined, '2026년 1월 4일 (일)'],
  ['list', '2026-09-03', 2026, '09.03'],
  ['list', '2025-12-31', 2026, '2025.12.31'],
] as const)('formatDateForDisplay(%s, %s) follows spec', (kind, date, year, expected) => {
  expect(formatDateForDisplay(date, kind, year)).toBe(expected);
});

test.each([
  ['21:00', '오후 9:00'],
  ['09:05', '오전 9:05'],
  ['00:00', '오전 12:00'],
  ['12:00', '오후 12:00'],
])('formatTimeForDisplay(%s)', (time, expected) => {
  expect(formatTimeForDisplay(time)).toBe(expected);
});

test('formatOverdueScheduleDays follows spec', () => {
  expect(formatOverdueScheduleDays('2026-09-03', '2026-09-06')).toBe('3일 지남');
});
