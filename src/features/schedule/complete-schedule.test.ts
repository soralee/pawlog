import { completeSchedule, SCHEDULE_COMPLETION_ERROR_MESSAGES } from './complete-schedule';

test('accepts a valid today or past completion date when schedule is pending', () => {
  expect(completeSchedule(false, '2026-09-15', '2026-09-15').canComplete).toBe(true);
  expect(completeSchedule(false, '2026-09-14', '2026-09-15').canComplete).toBe(true);
});

test.each([
  { completed: true, date: '2026-09-14', today: '2026-09-15', reason: 'already-completed' },
  { completed: false, date: 'bad', today: '2026-09-15', reason: 'invalid-date' },
  { completed: false, date: '2026-09-16', today: '2026-09-15', reason: 'future-date' },
])('rejects invalid completion ($reason)', ({ completed, date, today }) => {
  expect(completeSchedule(completed, date, today).canComplete).toBe(false);
});

test('호출부 기본값으로 현재 날짜 이후의 완료 날짜를 거부한다', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-09-15T12:00:00.000Z'));
  expect(completeSchedule(false, '2026-09-16')).toEqual({
    canComplete: false,
    completionDate: null,
    reason: 'future-date',
  });
  jest.useRealTimers();
});

test('완료 거부 사유에 대응하는 한국어 문구를 제공한다', () => {
  expect(SCHEDULE_COMPLETION_ERROR_MESSAGES).toEqual({
    'already-completed': '이미 완료된 일정이에요',
    'invalid-date': 'YYYY-MM-DD 형식의 실제 날짜를 입력해주세요',
    'future-date': '미래 날짜로는 완료할 수 없어요',
  });
});
