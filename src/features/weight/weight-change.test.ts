import type { WeightRecord } from '@/db/repositories/weight-record.repository';

import { computeWeightChange } from './weight-change';

function makeRecord(measuredAt: string, weightKg: number): WeightRecord {
  return {
    id: measuredAt,
    petId: 'p1',
    measuredAt,
    weightKg,
    memo: null,
    createdAt: '',
    updatedAt: '',
  };
}

test('최근 6개월 구간 안의 가장 이른 기록과 가장 최근 기록의 차이를 구한다', () => {
  const records = [
    makeRecord('2026-01-01', 4.0), // 6개월보다 전 — 구간 밖
    makeRecord('2026-06-01', 4.2),
    makeRecord('2026-09-01', 4.5),
    makeRecord('2026-10-01', 4.3),
  ];

  const change = computeWeightChange(records, 6, '2026-10-06');
  expect(change?.fromKg).toBe(4.2);
  expect(change?.toKg).toBe(4.3);
  expect(change?.deltaKg).toBeCloseTo(0.1);
});

test('구간 안에 기록이 1개뿐이면 null을 반환한다', () => {
  const records = [makeRecord('2026-10-01', 4.3)];
  expect(computeWeightChange(records, 6, '2026-10-06')).toBeNull();
});

test('기록이 전혀 없으면 null을 반환한다', () => {
  expect(computeWeightChange([], 6, '2026-10-06')).toBeNull();
});
