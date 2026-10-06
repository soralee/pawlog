import type { HospitalExpense } from '@/db/repositories/hospital-expense.repository';

import { sumCurrentMonth } from './monthly-total';

function makeExpense(overrides: Partial<HospitalExpense>): HospitalExpense {
  return {
    id: 'e1',
    petId: 'pet-1',
    spentAt: '2026-09-01',
    amount: 10000,
    hospitalName: null,
    description: null,
    memo: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

test('이번 달 지출만 합산한다', () => {
  const thisMonth1 = makeExpense({ spentAt: '2026-09-03', amount: 40000 });
  const thisMonth2 = makeExpense({ spentAt: '2026-09-20', amount: 85000 });
  const lastMonth = makeExpense({ spentAt: '2026-08-22', amount: 50000 });

  expect(sumCurrentMonth([thisMonth1, thisMonth2, lastMonth], '2026-09-25')).toBe(125000);
});

test('이번 달 지출이 없으면 0이다', () => {
  const lastMonth = makeExpense({ spentAt: '2026-08-22', amount: 50000 });
  expect(sumCurrentMonth([lastMonth], '2026-09-25')).toBe(0);
});
