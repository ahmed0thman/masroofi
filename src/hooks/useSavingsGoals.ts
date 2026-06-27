import { useState, useEffect, useCallback } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, type SavingsGoal, type CreateGoalInput } from '@/db/savings-goal-repo';

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const g = await getGoals();
      setGoals(g);
    } catch {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (input: CreateGoalInput) => {
    const id = await createGoal(input);
    await refresh();
    return id;
  }, [refresh]);

  const update = useCallback(async (id: number, updates: Partial<SavingsGoal>) => {
    await updateGoal(id, updates);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await deleteGoal(id);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { goals, isLoading, createGoal: create, updateGoal: update, deleteGoal: remove, refresh };
}
