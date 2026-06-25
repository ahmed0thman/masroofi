import type { ExpenseRecord } from '@/services/gemini';

let pending: ExpenseRecord[] = [];

export function setPendingExpenses(records: ExpenseRecord[]) {
  pending = [...records];
}

export function getPendingExpenses(): ExpenseRecord[] {
  return pending;
}

export function updatePendingExpense(index: number, updates: Partial<ExpenseRecord>) {
  if (pending[index]) {
    pending[index] = { ...pending[index], ...updates };
  }
}

export function removePendingExpense(index: number) {
  pending.splice(index, 1);
}

export function clearPendingExpenses() {
  pending = [];
}
