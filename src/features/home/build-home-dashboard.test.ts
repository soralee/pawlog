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

test('펫 카드의 actionLabel은 오늘 복약이 있으면 우선, 없으면 다음 일정 D-day를 보여준다', () => {
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
  mocha.medications = [
    {
      id: 'm1',
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

  const result = buildHomeDashboard([bori, mocha], '2026-10-06');
  expect(result.petSummaries).toEqual([
    { pet: bori.pet, actionLabel: 'D-14 종합백신' },
    { pet: mocha.pet, actionLabel: '오늘 복약 21:00' },
  ]);
});

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

  const result = buildHomeDashboard([bori, mocha], '2026-10-06');
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

  const result = buildHomeDashboard([bori, mocha], '2026-10-06');
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

  const result = buildHomeDashboard([bori, mocha], '2026-10-06');
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

  const result = buildHomeDashboard([bori, mocha], '2026-10-06');
  expect(result.recentRecords.map((r) => `[${r.petName}] ${r.title}`)).toEqual([
    '[보리] 건강검진',
    '[모카] 체중 6.2kg',
  ]);
});
