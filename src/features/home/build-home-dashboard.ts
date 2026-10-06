import type { Checkup } from '@/db/repositories/checkup.repository';
import type { HealthRecord } from '@/db/repositories/health-record.repository';
import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';
import type { Medication } from '@/db/repositories/medication.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';
import type { WeightRecord } from '@/db/repositories/weight-record.repository';
import { sumCurrentMonth } from '@/features/hospital-expense/monthly-total';
import { splitMedications } from '@/features/medication/split-medications';
import { aggregateSchedule, type ScheduleEntry } from '@/features/schedule/aggregate-schedule';
import { todayDateString } from '@/utils/date';

export type RecentRecordType = 'health' | 'vaccination' | 'checkup' | 'weight';
export type RecentRecord = { id: string; type: RecentRecordType; date: string; title: string };

export type HomeDashboardData = {
  nextSchedule: ScheduleEntry | null;
  todayMedications: Medication[];
  monthlyExpenseTotal: number;
  recentRecords: RecentRecord[];
};

const RECENT_RECORDS_LIMIT = 5;

export function buildHomeDashboard(
  data: {
    healthRecords: HealthRecord[];
    vaccinations: Vaccination[];
    checkups: Checkup[];
    weightRecords: WeightRecord[];
    medications: Medication[];
    hospitalExpenses: HospitalExpense[];
  },
  today: string = todayDateString(),
): HomeDashboardData {
  const schedule = aggregateSchedule(data.vaccinations, data.checkups);

  const recentRecords: RecentRecord[] = [
    ...data.healthRecords.map((r) => ({
      id: r.id,
      type: 'health' as const,
      date: r.recordedAt,
      title: '건강 기록',
    })),
    ...data.vaccinations.map((r) => ({
      id: r.id,
      type: 'vaccination' as const,
      date: r.vaccinatedAt,
      title: r.vaccineName,
    })),
    ...data.checkups.map((r) => ({
      id: r.id,
      type: 'checkup' as const,
      date: r.checkedAt,
      title: r.checkupType,
    })),
    ...data.weightRecords.map((r) => ({
      id: r.id,
      type: 'weight' as const,
      date: r.measuredAt,
      title: `체중 ${r.weightKg}kg`,
    })),
  ];
  recentRecords.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return {
    nextSchedule: schedule[0] ?? null,
    todayMedications: splitMedications(data.medications, today).active,
    monthlyExpenseTotal: sumCurrentMonth(data.hospitalExpenses, today),
    recentRecords: recentRecords.slice(0, RECENT_RECORDS_LIMIT),
  };
}
