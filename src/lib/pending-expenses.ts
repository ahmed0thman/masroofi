import type { ExpenseRecord } from '@/services/gemini';

let pending: ExpenseRecord[] = [];
let isLoading = false;
let subscribers: Set<() => void> = new Set();

export function setPendingLoading() {
  isLoading = true;
  pending = [];
}

export function setPendingExpenses(records: ExpenseRecord[]) {
  pending = [...records];
  isLoading = false;
  subscribers.forEach((cb) => cb());
}

export function getPendingExpenses(): ExpenseRecord[] {
  return pending;
}

export function isPendingLoading(): boolean {
  return isLoading;
}

export function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
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
  isLoading = false;
}
