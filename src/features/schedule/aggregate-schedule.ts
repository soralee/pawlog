import type { Checkup } from '@/db/repositories/checkup.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';

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
