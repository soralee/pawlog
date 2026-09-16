import type { Checkup } from '@/db/repositories/checkup.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';

import { aggregateSchedule } from './aggregate-schedule';

function makeVaccination(overrides: Partial<Vaccination>): Vaccination {
  return {
    id: 'v1',
    petId: 'pet-1',
    vaccineName: '종합백신',
    vaccinatedAt: '2026-06-01',
    nextDueAt: null,
    hospitalName: null,
    memo: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeCheckup(overrides: Partial<Checkup>): Checkup {
  return {
    id: 'c1',
    petId: 'pet-1',
    checkupType: '건강검진',
    checkedAt: '2026-06-01',
    nextDueAt: null,
    hospitalName: null,
    memo: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

test('nextDueAt이 없는 기록은 제외한다', () => {
  const result = aggregateSchedule([makeVaccination({ nextDueAt: null })], []);
  expect(result).toEqual([]);
});

test('접종/검진을 날짜 오름차순으로 합쳐 정렬한다', () => {
  const vaccination = makeVaccination({ id: 'v1', nextDueAt: '2026-10-05', vaccineName: '광견병' });
  const checkup = makeCheckup({ id: 'c1', nextDueAt: '2026-09-28', checkupType: '심장 검진' });

  const result = aggregateSchedule([vaccination], [checkup]);

  expect(result).toEqual([
    { id: 'c1', type: 'checkup', date: '2026-09-28', title: '심장 검진' },
    { id: 'v1', type: 'vaccination', date: '2026-10-05', title: '광견병' },
  ]);
});
