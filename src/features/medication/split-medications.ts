import { format, getDay, parseISO } from 'date-fns';
import type { Medication } from '@/db/repositories/medication.repository';
import { todayDateString } from '@/utils/date';

export type SplitMedications = { active: Medication[]; ended: Medication[] };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** 자유 입력 frequency를 판정한다. 해석할 수 없는 표현은 매일 복용으로 간주한다. */
export function isMedicationDueToday(
  medication: Medication,
  today: string = todayDateString(),
): boolean {
  if (medication.startDate > today || (medication.endDate && medication.endDate < today))
    return false;
  if (/매주/.test(medication.frequency)) {
    const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const weekdayTokens = [...medication.frequency.matchAll(/([월화수목금토일])요일/g)].map(
      (match) => match[1],
    );
    if (weekdayTokens.length === 0) {
      weekdayTokens.push(
        ...[...medication.frequency.matchAll(/([월화수목금토일])(?=[,·\s]|$)/g)].map(
          (match) => match[1],
        ),
      );
    }
    const todayWeekday = weekdayNames[getDay(parseISO(today))];
    if (weekdayTokens.length > 0) return weekdayTokens.includes(todayWeekday);
    return getDay(parseISO(medication.startDate)) === getDay(parseISO(today));
  }
  return true;
}

/** 오늘 복용 대상 중 현재 시각 이후 가장 이른 복약 시간을 반환한다. */
export function getNextMedicationTime(
  medications: Medication[],
  now: Date = new Date(),
): string | null {
  const today = format(now, 'yyyy-MM-dd');
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const next = medications
    .filter((medication) => isMedicationDueToday(medication, today))
    .map((medication) => medication.time)
    .filter((time) => TIME_PATTERN.test(time) && time > currentTime)
    .sort()[0];
  return next ?? null;
}

/** "HH:mm" 오름차순 비교. 유효하지 않은 시간은 뒤로 보내고, 같은 순위끼리는 0을 반환한다. */
export function compareMedicationTime(a: string, b: string): number {
  const aValid = TIME_PATTERN.test(a);
  const bValid = TIME_PATTERN.test(b);
  if (aValid !== bValid) return aValid ? -1 : 1;
  if (!aValid) return 0;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 복약 목록을 시간 오름차순으로 정렬한 새 배열을 반환한다. 같은 시간은 기존 순서를 유지한다. */
export function sortMedicationsByTime(medications: Medication[]): Medication[] {
  return [...medications].sort((a, b) => compareMedicationTime(a.time, b.time));
}

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
