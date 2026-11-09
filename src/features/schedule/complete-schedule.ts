import { isValidDateString, todayDateString } from '@/utils/date';

export type ScheduleCompletion = {
  canComplete: boolean;
  completionDate: string | null;
  reason?: 'already-completed' | 'invalid-date' | 'future-date';
};

export const SCHEDULE_COMPLETION_ERROR_MESSAGES = {
  'already-completed': '이미 완료된 일정이에요',
  'invalid-date': 'YYYY-MM-DD 형식의 실제 날짜를 입력해주세요',
  'future-date': '미래 날짜로는 완료할 수 없어요',
} as const;

export function completeSchedule(
  alreadyCompleted: boolean,
  completionDate: string,
  today: string = todayDateString(),
): ScheduleCompletion {
  if (alreadyCompleted)
    return { canComplete: false, completionDate: null, reason: 'already-completed' };
  if (!isValidDateString(completionDate))
    return { canComplete: false, completionDate: null, reason: 'invalid-date' };
  if (completionDate > today)
    return { canComplete: false, completionDate: null, reason: 'future-date' };
  return { canComplete: true, completionDate };
}
