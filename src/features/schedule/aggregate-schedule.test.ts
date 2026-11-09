import type { Checkup } from '@/db/repositories/checkup.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';

import {
  aggregateSchedule,
  getNextUpcomingSchedule,
  getUpcomingSchedule,
  type ScheduleEntry,
} from './aggregate-schedule';

function makeVaccination(overrides: Partial<Vaccination>): Vaccination {
  return {
    id: 'v1',
    petId: 'pet-1',
    vaccineName: '종합백신',
    vaccinatedAt: null,
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
    checkedAt: null,
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

test('이미 완료된(vaccinatedAt/checkedAt이 채워진) 기록은 일정에서 제외한다', () => {
  const completedVaccination = makeVaccination({
    nextDueAt: '2026-10-05',
    vaccinatedAt: '2026-09-01',
  });
  const completedCheckup = makeCheckup({ nextDueAt: '2026-09-28', checkedAt: '2026-09-01' });

  const result = aggregateSchedule([completedVaccination], [completedCheckup]);

  expect(result).toEqual([]);
});

function makeEntry(id: string, date: string): ScheduleEntry {
  return { id, type: 'vaccination', date, title: id };
}

test('getUpcomingSchedule은 어제 일정을 빼고 오늘·내일 일정만 순서대로 반환한다', () => {
  const entries = [
    makeEntry('yesterday', '2026-11-08'),
    makeEntry('today', '2026-11-09'),
    makeEntry('tomorrow', '2026-11-10'),
  ];
  expect(getUpcomingSchedule(entries, '2026-11-09').map((entry) => entry.id)).toEqual([
    'today',
    'tomorrow',
  ]);
});

test('getUpcomingSchedule은 지난 일정만 있으면 빈 배열이다', () => {
  expect(getUpcomingSchedule([makeEntry('yesterday', '2026-11-08')], '2026-11-09')).toEqual([]);
});

test('getNextUpcomingSchedule은 지난 미완료 일정을 건너뛰고 오늘 포함 가장 가까운 일정을 반환한다', () => {
  const vaccinations = [
    makeVaccination({ id: 'v-past', nextDueAt: '2026-11-04' }),
    makeVaccination({ id: 'v-later', nextDueAt: '2026-11-20' }),
  ];
  const checkups = [makeCheckup({ id: 'c-today', nextDueAt: '2026-11-09' })];
  expect(getNextUpcomingSchedule(vaccinations, checkups, '2026-11-09')).toEqual({
    id: 'c-today',
    type: 'checkup',
    date: '2026-11-09',
    title: '건강검진',
  });
});

test('getNextUpcomingSchedule은 지난 일정만 있거나 일정이 없으면 null이다', () => {
  const vaccinations = [makeVaccination({ nextDueAt: '2026-11-08' })];
  expect(getNextUpcomingSchedule(vaccinations, [], '2026-11-09')).toBeNull();
  expect(getNextUpcomingSchedule([], [], '2026-11-09')).toBeNull();
});
