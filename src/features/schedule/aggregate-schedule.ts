import type { Checkup } from '@/db/repositories/checkup.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';

export type ScheduleType = 'vaccination' | 'checkup';

export type ScheduleEntry = {
  id: string;
  type: ScheduleType;
  date: string;
  title: string;
};

/** 접종/검진의 다음 예정일(nextDueAt)이 있는 것만 모아 날짜 오름차순으로 정렬한다. */
export function aggregateSchedule(
  vaccinations: Vaccination[],
  checkups: Checkup[],
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [
    ...vaccinations
      .filter((v) => v.nextDueAt)
      .map((v) => ({
        id: v.id,
        type: 'vaccination' as const,
        date: v.nextDueAt!,
        title: v.vaccineName,
      })),
    ...checkups
      .filter((c) => c.nextDueAt)
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
