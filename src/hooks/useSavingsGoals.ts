import { useState, useEffect, useCallback } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, type SavingsGoal, type CreateGoalInput } from '@/db/savings-goal-repo';
import { getWalletBalance } from '@/db/saving-wallet-repo';

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const [g, balance] = await Promise.all([getGoals(), getWalletBalance()]);
      setGoals(g);
      setWalletBalance(balance);
    } catch {
      setGoals([]);
      setWalletBalance(0);
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

  return { goals, walletBalance, isLoading, createGoal: create, updateGoal: update, deleteGoal: remove, refresh };
}
