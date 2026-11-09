import { format } from 'date-fns';
import type { Checkup } from '@/db/repositories/checkup.repository';
import type { HealthRecord } from '@/db/repositories/health-record.repository';
import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';
import type { Medication } from '@/db/repositories/medication.repository';
import type { Pet } from '@/db/repositories/pet.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';
import type { WeightRecord } from '@/db/repositories/weight-record.repository';
import { sumCurrentMonth } from '@/features/hospital-expense/monthly-total';
import {
  compareMedicationTime,
  isMedicationDueToday,
} from '@/features/medication/split-medications';
import {
  aggregateSchedule,
  getUpcomingSchedule,
  type ScheduleEntry,
} from '@/features/schedule/aggregate-schedule';

export type RecentRecordType = 'health' | 'vaccination' | 'checkup' | 'weight' | 'hospital-expense';
export type RecentRecord = {
  id: string;
  petId: string;
  petName: string;
  type: RecentRecordType;
  date: string;
  title: string;
  subtitle?: string;
};

export type TaggedScheduleEntry = ScheduleEntry & { petId: string; petName: string };
export type TaggedMedication = { petId: string; petName: string; medication: Medication };
export type ExpenseByPet = { petId: string; petName: string; amount: number };

export type PetSummary = { pet: Pet };

export type HomeDashboardData = {
  petSummaries: PetSummary[];
  upcomingSchedule: TaggedScheduleEntry[];
  /** 미완료 지난 일정이 하나라도 있으면 true — 홈에서 "지난 일정은 일정 탭에서…" 안내 여부. */
  hasOverdueSchedule: boolean;
  todayMedications: TaggedMedication[];
  monthlyExpenseTotal: number;
  monthlyExpenseByPet: ExpenseByPet[];
  recentRecords: RecentRecord[];
};

export type PetDashboardInput = {
  pet: Pet;
  healthRecords: HealthRecord[];
  vaccinations: Vaccination[];
  checkups: Checkup[];
  weightRecords: WeightRecord[];
  medications: Medication[];
  hospitalExpenses: HospitalExpense[];
};

const RECENT_RECORDS_LIMIT = 5;
const UPCOMING_SCHEDULE_LIMIT = 3;

export function buildHomeDashboard(
  petsData: PetDashboardInput[],
  now: Date = new Date(),
): HomeDashboardData {
  const today = format(now, 'yyyy-MM-dd');
  const petSummaries: PetSummary[] = petsData.map((input) => ({ pet: input.pet }));

  const allSchedule: TaggedScheduleEntry[] = petsData
    .flatMap((input) =>
      aggregateSchedule(input.vaccinations, input.checkups).map((entry) => ({
        ...entry,
        petId: input.pet.id,
        petName: input.pet.name,
      })),
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const upcomingEntries = getUpcomingSchedule(allSchedule, today);
  const upcomingSchedule = upcomingEntries.slice(0, UPCOMING_SCHEDULE_LIMIT);
  const hasOverdueSchedule = upcomingEntries.length < allSchedule.length;

  const todayMedications: TaggedMedication[] = petsData
    .flatMap((input) =>
      input.medications
        .filter((medication) => isMedicationDueToday(medication, today))
        .map((medication) => ({
          petId: input.pet.id,
          petName: input.pet.name,
          medication,
        })),
    )
    .sort((a, b) => compareMedicationTime(a.medication.time, b.medication.time));

  const monthlyExpenseByPet: ExpenseByPet[] = petsData.map((input) => ({
    petId: input.pet.id,
    petName: input.pet.name,
    amount: sumCurrentMonth(input.hospitalExpenses, today),
  }));
  const monthlyExpenseTotal = monthlyExpenseByPet.reduce((sum, p) => sum + p.amount, 0);

  const recentRecords: RecentRecord[] = petsData
    .flatMap((input) => [
      ...input.healthRecords.map((r) => ({
        id: r.id,
        petId: input.pet.id,
        petName: input.pet.name,
        type: 'health' as const,
        date: r.recordedAt,
        title: '건강 기록',
      })),
      // 완료하지 않은(vaccinatedAt/checkedAt이 없는) 예정 일정은 최근 기록이 아니라 일정이다.
      ...input.vaccinations
        .filter((r) => r.vaccinatedAt)
        .map((r) => ({
          id: r.id,
          petId: input.pet.id,
          petName: input.pet.name,
          type: 'vaccination' as const,
          date: r.vaccinatedAt!,
          title: r.vaccineName,
        })),
      ...input.checkups
        .filter((r) => r.checkedAt)
        .map((r) => ({
          id: r.id,
          petId: input.pet.id,
          petName: input.pet.name,
          type: 'checkup' as const,
          date: r.checkedAt!,
          title: r.checkupType,
        })),
      ...input.weightRecords.map((r) => ({
        id: r.id,
        petId: input.pet.id,
        petName: input.pet.name,
        type: 'weight' as const,
        date: r.measuredAt,
        title: `체중 ${r.weightKg}kg`,
      })),
      ...input.hospitalExpenses.map((r) => ({
        id: r.id,
        petId: input.pet.id,
        petName: input.pet.name,
        type: 'hospital-expense' as const,
        date: r.spentAt,
        title: r.description || '병원비',
        subtitle: r.hospitalName ?? undefined,
      })),
    ])
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, RECENT_RECORDS_LIMIT);

  return {
    petSummaries,
    upcomingSchedule,
    hasOverdueSchedule,
    todayMedications,
    monthlyExpenseTotal,
    monthlyExpenseByPet,
    recentRecords,
  };
}
