import type { WeightRecord } from '@/db/repositories/weight-record.repository';
import { todayDateString } from '@/utils/date';

export type WeightChange = { fromKg: number; toKg: number; deltaKg: number };

function monthsAgoDateString(today: string, months: number): string {
  const date = new Date(today);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

/**
 * 최근 N개월 안의 기록만 모아 가장 이른 기록과 가장 최근 기록의 체중 차이를 구한다.
 * 그 구간 안에 기록이 2개 미만이면 의미 있는 변화량이 없다(null).
 */
export function computeWeightChange(
  records: WeightRecord[],
  monthsBack = 6,
  today: string = todayDateString(),
): WeightChange | null {
  const since = monthsAgoDateString(today, monthsBack);
  const inWindow = records
    .filter((record) => record.measuredAt >= since)
    .sort((a, b) => (a.measuredAt < b.measuredAt ? -1 : 1));

  if (inWindow.length < 2) return null;

  const from = inWindow[0];
  const to = inWindow[inWindow.length - 1];
  return { fromKg: from.weightKg, toKg: to.weightKg, deltaKg: to.weightKg - from.weightKg };
}
