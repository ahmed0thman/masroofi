import { useState, useEffect, useCallback } from 'react';
import { getAllExpenses, insertExpenses, insertExpense, deleteExpense, updateExpense as updateExpenseDb, ExpenseRow, NewExpense } from '@/db/expense-repo';

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const e = await getAllExpenses();
      setExpenses(e ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMany = useCallback(async (items: NewExpense[]) => {
    const ids = await insertExpenses(items);
    await refresh();
    return ids;
  }, [refresh]);

  const addOne = useCallback(async (item: NewExpense) => {
    const id = await insertExpense(item);
    await refresh();
    return id;
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await deleteExpense(id);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: number, data: Parameters<typeof updateExpenseDb>[1]) => {
    await updateExpenseDb(id, data);
    await refresh();
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { expenses, isLoading, error, refresh, addExpenses: addMany, addExpense: addOne, deleteExpense: remove, updateExpense: update };
}
