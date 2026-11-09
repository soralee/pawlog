import type { Checkup } from '@/db/repositories/checkup.repository';
import type { HealthRecord } from '@/db/repositories/health-record.repository';
import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';
import type { Medication } from '@/db/repositories/medication.repository';
import type { Pet } from '@/db/repositories/pet.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';
import type { WeightRecord } from '@/db/repositories/weight-record.repository';

import { buildHomeDashboard, type PetDashboardInput } from './build-home-dashboard';

function makePet(id: string, name: string): Pet {
  return {
    id,
    name,
    birthDate: '2020-01-01',
    species: 'dog',
    gender: 'male',
    photoUri: null,
    createdAt: '',
    updatedAt: '',
  };
}

function emptyInput(pet: Pet): PetDashboardInput {
  return {
    pet,
    healthRecords: [] as HealthRecord[],
    vaccinations: [] as Vaccination[],
    checkups: [] as Checkup[],
    weightRecords: [] as WeightRecord[],
    medications: [] as Medication[],
    hospitalExpenses: [] as HospitalExpense[],
  };
}

test('여러 펫의 다가오는 일정을 날짜순으로 합쳐 펫 태그를 붙인다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.vaccinations = [
    {
      id: 'v1',
      petId: 'p1',
      vaccineName: '종합백신',
      vaccinatedAt: null,
      nextDueAt: '2026-10-20',
      hospitalName: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];
  const mocha = emptyInput(makePet('p2', '모카'));
  mocha.checkups = [
    {
      id: 'c1',
      petId: 'p2',
      checkupType: '심장사상충',
      checkedAt: null,
      nextDueAt: '2026-10-06',
      hospitalName: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const result = buildHomeDashboard([bori, mocha], new Date('2026-10-06T00:00:00'));
  expect(result.upcomingSchedule).toEqual([
    {
      id: 'c1',
      type: 'checkup',
      date: '2026-10-06',
      title: '심장사상충',
      petId: 'p2',
      petName: '모카',
    },
    {
      id: 'v1',
      type: 'vaccination',
      date: '2026-10-20',
      title: '종합백신',
      petId: 'p1',
      petName: '보리',
    },
  ]);
});

test('복용 중인 약만 펫 태그와 함께 todayMedications에 포함한다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.medications = [
    {
      id: 'm1',
      petId: 'p1',
      name: '항생제',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      time: '09:00',
      frequency: '매일',
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];
  const mocha = emptyInput(makePet('p2', '모카'));
  mocha.medications = [
    {
      id: 'm2',
      petId: 'p2',
      name: '영양제',
      startDate: '2026-09-01',
      endDate: null,
      time: '21:00',
      frequency: '매일',
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const result = buildHomeDashboard([bori, mocha], new Date('2026-10-06T00:00:00'));
  expect(result.todayMedications).toEqual([
    { petId: 'p2', petName: '모카', medication: mocha.medications[0] },
  ]);
});

test('이번 달 병원비는 펫별 Breakdown과 전체 합계를 함께 계산한다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.hospitalExpenses = [
    {
      id: 'e1',
      petId: 'p1',
      spentAt: '2026-10-02',
      amount: 85000,
      hospitalName: null,
      description: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];
  const mocha = emptyInput(makePet('p2', '모카'));
  mocha.hospitalExpenses = [
    {
      id: 'e2',
      petId: 'p2',
      spentAt: '2026-10-03',
      amount: 100000,
      hospitalName: null,
      description: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const result = buildHomeDashboard([bori, mocha], new Date('2026-10-06T00:00:00'));
  expect(result.monthlyExpenseTotal).toBe(185000);
  expect(result.monthlyExpenseByPet).toEqual([
    { petId: 'p1', petName: '보리', amount: 85000 },
    { petId: 'p2', petName: '모카', amount: 100000 },
  ]);
});

test('최근 기록을 여러 펫에 걸쳐 날짜 내림차순으로 최대 5개까지 모으고 펫 태그를 붙인다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.checkups = [
    {
      id: 'c1',
      petId: 'p1',
      checkupType: '건강검진',
      checkedAt: '2026-10-02',
      nextDueAt: null,
      hospitalName: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];
  const mocha = emptyInput(makePet('p2', '모카'));
  mocha.weightRecords = [
    {
      id: 'w1',
      petId: 'p2',
      measuredAt: '2026-09-28',
      weightKg: 6.2,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const result = buildHomeDashboard([bori, mocha], new Date('2026-10-06T00:00:00'));
  expect(result.recentRecords.map((r) => `[${r.petName}] ${r.title}`)).toEqual([
    '[보리] 건강검진',
    '[모카] 체중 6.2kg',
  ]);
});

function makeMedication(petId: string, id: string, name: string, time: string): Medication {
  return {
    id,
    petId,
    name,
    startDate: '2026-09-01',
    endDate: null,
    time,
    frequency: '매일',
    memo: null,
    createdAt: '',
    updatedAt: '',
  };
}

test('여러 펫의 todayMedications는 복약 시간 오름차순으로 정렬한다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.medications = [
    makeMedication('p1', 'm1', '저녁 약', '19:00'),
    makeMedication('p1', 'm2', '아침 약', '06:00'),
  ];
  const mocha = emptyInput(makePet('p2', '모카'));
  mocha.medications = [
    makeMedication('p2', 'm3', '영양제', '21:00'),
    makeMedication('p2', 'm4', '점심 약', '12:00'),
  ];

  const result = buildHomeDashboard([bori, mocha], new Date('2026-11-09T13:00:00'));
  expect(result.todayMedications.map((m) => `[${m.petName}] ${m.medication.time}`)).toEqual([
    '[보리] 06:00',
    '[모카] 12:00',
    '[보리] 19:00',
    '[모카] 21:00',
  ]);
});

function makeScheduledVaccination(
  petId: string,
  id: string,
  name: string,
  nextDueAt: string,
): Vaccination {
  return {
    id,
    petId,
    vaccineName: name,
    vaccinatedAt: null,
    nextDueAt,
    hospitalName: null,
    memo: null,
    createdAt: '',
    updatedAt: '',
  };
}

test('지난 일정은 다음 일정 한도를 차지하지 않고, 오늘 포함 가까운 일정 3개만 보인다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.vaccinations = [
    makeScheduledVaccination('p1', 'past1', '코로나 장염', '2026-11-04'),
    makeScheduledVaccination('p1', 'past2', '광견병', '2026-11-08'),
    makeScheduledVaccination('p1', 'today', '종합백신', '2026-11-09'),
    makeScheduledVaccination('p1', 'soon', '켄넬코프', '2026-11-12'),
    makeScheduledVaccination('p1', 'later', '인플루엔자', '2026-11-20'),
    makeScheduledVaccination('p1', 'latest', '심장사상충', '2026-12-01'),
  ];

  const result = buildHomeDashboard([bori], new Date('2026-11-09T13:00:00'));
  expect(result.upcomingSchedule.map((entry) => entry.id)).toEqual(['today', 'soon', 'later']);
  expect(result.hasOverdueSchedule).toBe(true);
});

test('지난 일정만 있으면 upcomingSchedule은 비고 hasOverdueSchedule은 true다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.vaccinations = [makeScheduledVaccination('p1', 'past', '광견병', '2026-11-08')];

  const result = buildHomeDashboard([bori], new Date('2026-11-09T13:00:00'));
  expect(result.upcomingSchedule).toEqual([]);
  expect(result.hasOverdueSchedule).toBe(true);
});

test('지난 일정이 없으면 hasOverdueSchedule은 false다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.vaccinations = [makeScheduledVaccination('p1', 'soon', '종합백신', '2026-11-12')];

  const result = buildHomeDashboard([bori], new Date('2026-11-09T13:00:00'));
  expect(result.hasOverdueSchedule).toBe(false);
});

test('펫 요약에는 actionLabel 없이 펫 정보만 담는다', () => {
  const bori = emptyInput(makePet('p1', '보리'));
  bori.medications = [makeMedication('p1', 'm1', '저녁 약', '19:00')];
  bori.vaccinations = [makeScheduledVaccination('p1', 'soon', '종합백신', '2026-11-12')];

  const result = buildHomeDashboard([bori], new Date('2026-11-09T13:00:00'));
  expect(result.petSummaries).toEqual([{ pet: bori.pet }]);
});
