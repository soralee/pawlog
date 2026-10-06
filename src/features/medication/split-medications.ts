import type { Medication } from '@/db/repositories/medication.repository';
import { todayDateString } from '@/utils/date';

export type SplitMedications = { active: Medication[]; ended: Medication[] };

/** 종료일이 없거나 오늘 이후면 복용 중, 오늘보다 이전이면 종료된 복약이다. */
export function splitMedications(
  medications: Medication[],
  today: string = todayDateString(),
): SplitMedications {
  const active: Medication[] = [];
  const ended: Medication[] = [];
  for (const medication of medications) {
    if (medication.endDate && medication.endDate < today) {
      ended.push(medication);
    } else {
      active.push(medication);
    }
  }
  return { active, ended };
}
