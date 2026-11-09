import {
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  isValid,
  parseISO,
  format as formatDate,
} from 'date-fns';
import { ko } from 'date-fns/locale';

/** 유효한 생일로부터 "N살 M개월" 형태의 나이 문자열을 만든다. 미래 생일은 빈 문자열이다. */
export function formatAge(birthDate: Date, now: Date = new Date()): string {
  if (!isValid(birthDate) || birthDate.getTime() > now.getTime()) return '';
  const years = differenceInYears(now, birthDate);
  const months = differenceInMonths(now, birthDate) % 12;

  if (years <= 0) {
    return `${months}개월`;
  }
  return months > 0 ? `${years}살 ${months}개월` : `${years}살`;
}

/** ISO 캘린더 날짜를 로컬 날짜로 파싱해 나이를 만든다. 빈 값·무효 날짜·미래 날짜는 빈 문자열이다. */
export function formatAgeFromDateString(birthDate: string, now: Date = new Date()): string {
  if (!isValidDateString(birthDate)) return '';
  const parsed = parseISO(birthDate);
  const today = parseISO(formatDate(now, 'yyyy-MM-dd'));
  if (parsed > today) return '';
  return formatAge(parsed, today);
}

/** "YYYY-MM-DD" 형식이면서 실제로 존재하는 날짜인지 확인한다(예: 2026-13-40은 거짓). */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return isValid(parseISO(value));
}

/** 오늘 날짜를 "YYYY-MM-DD"로 반환한다 — 날짜 입력 필드의 기본값으로 쓴다. */
export function todayDateString(): string {
  return formatDate(new Date(), 'yyyy-MM-dd');
}

export function formatDateForDisplay(
  date: string,
  kind: 'schedule' | 'list',
  referenceYear: number = new Date().getFullYear(),
): string {
  if (!isValidDateString(date)) return '';
  const parsed = parseISO(date);
  if (kind === 'schedule') return formatDate(parsed, 'yyyy년 M월 d일 (E)', { locale: ko });
  return parsed.getFullYear() === referenceYear
    ? formatDate(parsed, 'MM.dd', { locale: ko })
    : formatDate(parsed, 'yyyy.MM.dd', { locale: ko });
}

export function formatTimeForDisplay(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return '';
  const hour = Number(match[1]);
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}:${match[2]}`;
}

export function formatOverdueScheduleDays(
  dueDate: string,
  today: string = todayDateString(),
): string {
  if (!isValidDateString(dueDate) || !isValidDateString(today)) return '';
  const elapsed = differenceInCalendarDays(parseISO(today), parseISO(dueDate));
  return elapsed > 0 ? `${elapsed}일 지남` : '';
}

/** "YYYY-MM-DD"가 오늘로부터 며칠 후인지 계산한다. 지난 날짜는 음수. */
export function daysUntil(dateString: string, today: string = todayDateString()): number | null {
  if (!isValidDateString(dateString) || !isValidDateString(today)) return null;
  return differenceInCalendarDays(parseISO(dateString), parseISO(today));
}

/** daysUntil()의 결과를 "오늘"/"D-N"/"N일 지남" 형태로 표시한다. */
export function formatDDay(daysUntil: number): string {
  if (daysUntil === 0) return '오늘';
  if (daysUntil < 0) return `${Math.abs(daysUntil)}일 지남`;
  return `D-${daysUntil}`;
}
