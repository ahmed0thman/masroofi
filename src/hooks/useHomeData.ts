import { useState, useEffect, useCallback } from 'react';
import { getProfile, type Profile } from '@/db/profile-repo';
import { getAllExpenses, type ExpenseRow } from '@/db/expense-repo';

export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [p, e] = await Promise.all([getProfile(), getAllExpenses()]);
      setProfile(p);
      setExpenses(e ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { profile, expenses, isLoading, error, refresh };
}
