import type { Medication } from '@/db/repositories/medication.repository';

import {
  getNextMedicationTime,
  isMedicationDueToday,
  sortMedicationsByTime,
  splitMedications,
} from './split-medications';

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

test('미래 시작 복약도 복약 목록의 active에 남긴다', () => {
  const medication = makeMedication({ startDate: '2026-09-20' });
  expect(splitMedications([medication], '2026-09-15').active).toEqual([medication]);
});

test('오늘 복용 여부는 시작일과 종료일 경계를 포함한다', () => {
  expect(isMedicationDueToday(makeMedication({ startDate: '2026-09-16' }), '2026-09-15')).toBe(
    false,
  );
  expect(
    isMedicationDueToday(
      makeMedication({ startDate: '2026-09-15', endDate: '2026-09-15' }),
      '2026-09-15',
    ),
  ).toBe(true);
  expect(isMedicationDueToday(makeMedication({ endDate: '2026-09-14' }), '2026-09-15')).toBe(false);
});

test('매주 복약은 오늘의 요일에만 대상이다', () => {
  const medication = makeMedication({ frequency: '매주 월, 수, 금' });
  expect(isMedicationDueToday(medication, '2026-09-14')).toBe(true);
  expect(isMedicationDueToday(medication, '2026-09-15')).toBe(false);
});

test('요일 없는 매주 복약은 시작일과 같은 요일에 대상이며 미해석 빈도는 매일 대상이다', () => {
  expect(
    isMedicationDueToday(
      makeMedication({ startDate: '2026-09-14', frequency: '매주 1회' }),
      '2026-09-21',
    ),
  ).toBe(true);
  expect(
    isMedicationDueToday(
      makeMedication({ startDate: '2026-09-14', frequency: '매주 1회' }),
      '2026-09-22',
    ),
  ).toBe(false);
  expect(isMedicationDueToday(makeMedication({ frequency: '' }), '2026-09-15')).toBe(true);
  expect(isMedicationDueToday(makeMedication({ frequency: '필요 시 복용' }), '2026-09-15')).toBe(
    true,
  );
});

test.each([
  ['매주 월요일', '2026-09-20', false],
  ['매주 월요일', '2026-09-21', true],
  ['매주 수요일', '2026-09-23', true],
  ['매주 일요일', '2026-09-20', true],
  ['매주 월·수', '2026-09-23', true],
  ['매주 1회', '2026-09-21', true],
])('요일 복약 판정: %s on %s', (frequency, today, expected) => {
  const medication = makeMedication({ startDate: '2026-09-14', frequency });
  expect(isMedicationDueToday(medication, today)).toBe(expected);
});

test('다음 복약은 오늘 대상 중 현재 시각 이후 가장 이른 시간을 반환한다', () => {
  const medications = [
    makeMedication({ id: 'past', time: '08:00' }),
    makeMedication({ id: 'late', time: '21:00' }),
    makeMedication({ id: 'soon', time: '13:30' }),
    makeMedication({ id: 'not-today', frequency: '매주 월요일', time: '14:00' }),
  ];
  expect(getNextMedicationTime(medications, new Date('2026-09-15T12:00:00'))).toBe('13:30');
});

test('오늘 남은 복약이 없으면 다음 복약은 null이다', () => {
  expect(
    getNextMedicationTime([makeMedication({ time: '08:00' })], new Date('2026-09-15T12:00:00')),
  ).toBeNull();
});

test('복약 목록을 시간 오름차순으로 정렬하고 원본 배열은 바꾸지 않는다', () => {
  const medications = [
    makeMedication({ id: 'evening', time: '19:00' }),
    makeMedication({ id: 'morning', time: '06:00' }),
    makeMedication({ id: 'night', time: '21:00' }),
  ];
  expect(sortMedicationsByTime(medications).map((m) => m.id)).toEqual([
    'morning',
    'evening',
    'night',
  ]);
  expect(medications.map((m) => m.id)).toEqual(['evening', 'morning', 'night']);
});

test('유효하지 않은 시간은 뒤로 보내고 같은 시간끼리는 기존 순서를 유지한다', () => {
  const medications = [
    makeMedication({ id: 'invalid', time: '25:00' }),
    makeMedication({ id: 'empty', time: '' }),
    makeMedication({ id: 'first-9', time: '09:00' }),
    makeMedication({ id: 'second-9', time: '09:00' }),
    makeMedication({ id: 'morning', time: '07:30' }),
  ];
  expect(sortMedicationsByTime(medications).map((m) => m.id)).toEqual([
    'morning',
    'first-9',
    'second-9',
    'invalid',
    'empty',
  ]);
});
