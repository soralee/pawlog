import type { Checkup } from '@/db/repositories/checkup.repository';
import type { HealthRecord } from '@/db/repositories/health-record.repository';
import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';
import type { Medication } from '@/db/repositories/medication.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';
import type { WeightRecord } from '@/db/repositories/weight-record.repository';

import { buildHomeDashboard } from './build-home-dashboard';

function emptyData() {
  return {
    healthRecords: [] as HealthRecord[],
    vaccinations: [] as Vaccination[],
    checkups: [] as Checkup[],
    weightRecords: [] as WeightRecord[],
    medications: [] as Medication[],
    hospitalExpenses: [] as HospitalExpense[],
  };
}

test('가장 가까운 일정 하나를 nextSchedule로 반환한다', () => {
  const data = emptyData();
  data.vaccinations = [
    {
      id: 'v1',
      petId: 'pet-1',
      vaccineName: '종합백신',
      vaccinatedAt: '2026-06-01',
      nextDueAt: '2026-10-20',
      hospitalName: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const result = buildHomeDashboard(data, '2026-10-06');
  expect(result.nextSchedule).toEqual({
    id: 'v1',
    type: 'vaccination',
    date: '2026-10-20',
    title: '종합백신',
  });
});

test('복용 중인 약만 todayMedications에 포함한다', () => {
  const data = emptyData();
  data.medications = [
    {
      id: 'm1',
      petId: 'pet-1',
      name: '영양제',
      startDate: '2026-09-01',
      endDate: null,
      time: '21:00',
      frequency: '매일',
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm2',
      petId: 'pet-1',
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

  const result = buildHomeDashboard(data, '2026-10-06');
  expect(result.todayMedications.map((m) => m.name)).toEqual(['영양제']);
});

test('이번 달 병원비 합계를 계산한다', () => {
  const data = emptyData();
  data.hospitalExpenses = [
    {
      id: 'e1',
      petId: 'pet-1',
      spentAt: '2026-10-02',
      amount: 85000,
      hospitalName: null,
      description: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  expect(buildHomeDashboard(data, '2026-10-06').monthlyExpenseTotal).toBe(85000);
});

test('최근 기록을 날짜 내림차순으로 최대 5개까지 모은다', () => {
  const data = emptyData();
  data.checkups = [
    {
      id: 'c1',
      petId: 'pet-1',
      checkupType: '건강검진',
      checkedAt: '2026-10-02',
      nextDueAt: null,
      hospitalName: null,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];
  data.weightRecords = [
    {
      id: 'w1',
      petId: 'pet-1',
      measuredAt: '2026-09-28',
      weightKg: 4.3,
      memo: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const result = buildHomeDashboard(data, '2026-10-06');
  expect(result.recentRecords.map((r) => r.title)).toEqual(['건강검진', '체중 4.3kg']);
});
