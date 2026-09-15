import { differenceInMonths, differenceInYears } from 'date-fns';

/** 생일로부터 "N살 M개월" 형태의 나이 문자열을 만든다. */
export function formatAge(birthDate: Date, now: Date = new Date()): string {
  const years = differenceInYears(now, birthDate);
  const months = differenceInMonths(now, birthDate) % 12;

  if (years <= 0) {
    return `${months}개월`;
  }
  return months > 0 ? `${years}살 ${months}개월` : `${years}살`;
}
