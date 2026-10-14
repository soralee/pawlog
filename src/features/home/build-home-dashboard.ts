import type { Checkup } from '@/db/repositories/checkup.repository';
import type { HealthRecord } from '@/db/repositories/health-record.repository';
import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';
import type { Medication } from '@/db/repositories/medication.repository';
import type { Pet } from '@/db/repositories/pet.repository';
import type { Vaccination } from '@/db/repositories/vaccination.repository';
import type { WeightRecord } from '@/db/repositories/weight-record.repository';
import { sumCurrentMonth } from '@/features/hospital-expense/monthly-total';
import { splitMedications } from '@/features/medication/split-medications';
import { aggregateSchedule, type ScheduleEntry } from '@/features/schedule/aggregate-schedule';
import { daysUntil, formatDDay, todayDateString } from '@/utils/date';

export type RecentRecordType = 'health' | 'vaccination' | 'checkup' | 'weight';
export type RecentRecord = {
  id: string;
  petId: string;
  petName: string;
  type: RecentRecordType;
  date: string;
  title: string;
};

export type TaggedScheduleEntry = ScheduleEntry & { petId: string; petName: string };
export type TaggedMedication = { petId: string; petName: string; medication: Medication };
export type ExpenseByPet = { petId: string; petName: string; amount: number };

export type PetSummary = {
  pet: Pet;
  /** "오늘 복약 21:00" 또는 "D-14 예방접종" — 둘 다 없으면 null. */
  actionLabel: string | null;
};

export type HomeDashboardData = {
  petSummaries: PetSummary[];
  upcomingSchedule: TaggedScheduleEntry[];
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
const UPCOMING_SCHEDULE_LIMIT = 5;

function actionLabelFor(input: PetDashboardInput, today: string): string | null {
  const activeToday = splitMedications(input.medications, today).active;
  if (activeToday.length > 0) {
    const soonest = [...activeToday].sort((a, b) => (a.time < b.time ? -1 : 1))[0];
    return `오늘 복약 ${soonest.time}`;
  }
  const nextSchedule = aggregateSchedule(input.vaccinations, input.checkups)[0];
  if (nextSchedule) {
    return `${formatDDay(daysUntil(nextSchedule.date, today))} ${nextSchedule.title}`;
  }
  return null;
}

export function buildHomeDashboard(
  petsData: PetDashboardInput[],
  today: string = todayDateString(),
): HomeDashboardData {
  const petSummaries: PetSummary[] = petsData.map((input) => ({
    pet: input.pet,
    actionLabel: actionLabelFor(input, today),
  }));

  const upcomingSchedule: TaggedScheduleEntry[] = petsData
    .flatMap((input) =>
      aggregateSchedule(input.vaccinations, input.checkups).map((entry) => ({
        ...entry,
        petId: input.pet.id,
        petName: input.pet.name,
      })),
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(0, UPCOMING_SCHEDULE_LIMIT);

  const todayMedications: TaggedMedication[] = petsData.flatMap((input) =>
    splitMedications(input.medications, today).active.map((medication) => ({
      petId: input.pet.id,
      petName: input.pet.name,
      medication,
    })),
  );

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
    ])
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, RECENT_RECORDS_LIMIT);

  return {
    petSummaries,
    upcomingSchedule,
    todayMedications,
    monthlyExpenseTotal,
    monthlyExpenseByPet,
    recentRecords,
  };
}
