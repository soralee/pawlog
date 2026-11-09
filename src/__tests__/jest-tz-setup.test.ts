import { todayDateString } from '@/utils/date';

test('jest setupFiles가 TZ를 Asia/Seoul로 고정한다', () => {
  expect(process.env.TZ).toBe('Asia/Seoul');
});

test('todayDateString은 setup TZ 기준 로컬 날짜를 반환한다', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-06-01T15:30:00.000Z'));
  expect(todayDateString()).toBe('2026-06-02');
  jest.useRealTimers();
});
