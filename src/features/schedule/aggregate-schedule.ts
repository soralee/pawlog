import type { Checkup } from '@/db/repositories/checkup.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';
import { todayDateString } from '@/utils/date';

export type ScheduleType = 'vaccination' | 'checkup';

export type ScheduleEntry = {
  id: string;
  type: ScheduleType;
  date: string;
  title: string;
};

/**
 * 아직 완료하지 않은(vaccinatedAt/checkedAt이 비어있는) 예정 일정만 모아 날짜 오름차순으로
 * 정렬한다 — 완료된 기록은 Schedule이 아니라 Records에 속한다(screen-layout.md §26).
 */
export function aggregateSchedule(
  vaccinations: Vaccination[],
  checkups: Checkup[],
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [
    ...vaccinations
      .filter((v) => v.nextDueAt && !v.vaccinatedAt)
      .map((v) => ({
        id: v.id,
        type: 'vaccination' as const,
        date: v.nextDueAt!,
        title: v.vaccineName,
      })),
    ...checkups
      .filter((c) => c.nextDueAt && !c.checkedAt)
      .map((c) => ({
        id: c.id,
        type: 'checkup' as const,
        date: c.nextDueAt!,
        title: c.checkupType,
      })),
  ];
  entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return entries;
}

/** 오늘(D-0) 이후의 일정만 남긴다 — 홈·Pet 카드·index 요약의 "다음 일정"은 지난 일정을 포함하지 않는다. */
export function getUpcomingSchedule<T extends ScheduleEntry>(
  entries: T[],
  today: string = todayDateString(),
): T[] {
  return entries.filter((entry) => entry.date >= today);
}

/** 오늘 포함 가장 가까운 미완료 일정 1건. 없으면(지난 일정만 있어도) null이다. */
export function getNextUpcomingSchedule(
  vaccinations: Vaccination[],
  checkups: Checkup[],
  today: string = todayDateString(),
): ScheduleEntry | null {
  return getUpcomingSchedule(aggregateSchedule(vaccinations, checkups), today)[0] ?? null;
}
