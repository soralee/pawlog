import type { Medication } from '@/db/repositories/medication.repository';

import { splitMedications } from './split-medications';

function makeMedication(overrides: Partial<Medication>): Medication {
  return {
    id: 'm1',
    petId: 'pet-1',
    name: '영양제',
    startDate: '2026-09-01',
    endDate: null,
    time: '21:00',
    frequency: '매일',
    memo: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

test('종료일이 없으면 복용 중으로 분류한다', () => {
  const medication = makeMedication({ endDate: null });
  expect(splitMedications([medication], '2026-09-15')).toEqual({
    active: [medication],
    ended: [],
  });
});

test('종료일이 오늘 이후면 복용 중으로 분류한다', () => {
  const medication = makeMedication({ endDate: '2026-09-20' });
  expect(splitMedications([medication], '2026-09-15')).toEqual({
    active: [medication],
    ended: [],
  });
});

test('종료일이 오늘보다 이전이면 종료된 복약으로 분류한다', () => {
  const medication = makeMedication({ endDate: '2026-09-10' });
  expect(splitMedications([medication], '2026-09-15')).toEqual({
    active: [],
    ended: [medication],
  });
});
