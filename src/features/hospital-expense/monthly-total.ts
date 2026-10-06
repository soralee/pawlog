import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';
import { todayDateString } from '@/utils/date';

/** 오늘과 같은 연-월(spentAt 기준)인 병원비의 합계를 구한다. */
export function sumCurrentMonth(
  expenses: HospitalExpense[],
  today: string = todayDateString(),
): number {
  const month = today.slice(0, 7); // "YYYY-MM"
  return expenses
    .filter((expense) => expense.spentAt.slice(0, 7) === month)
    .reduce((sum, expense) => sum + expense.amount, 0);
}
