import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile } from '@/db/profile-repo';
import { getBudgetProgress, setMonthlyBudget, removeBudget } from '@/db/budget-repo';
import { aggregateExpensesForPeriod } from '@/db/expense-repo';
import { getCurrentMonth } from '@/services/format';
import { getMonthPeriod } from '@/services/analytics';

export function useBudget() {
  const [budget, setBudget] = useState<number>(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<Array<{ categoryId: number | null; categoryName: string; budget: number; spent: number; percentage: number }>>([]);

  const month = getCurrentMonth();

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      const monthlyBudget = profile?.monthly_budget ?? 0;
      setBudget(monthlyBudget);

      const period = getMonthPeriod(new Date());
      const aggregated = await aggregateExpensesForPeriod(period.start, period.end);
      const spentVal = aggregated.totalSpent;
      setSpent(spentVal);

      if (monthlyBudget > 0) {
        setRemaining(Math.max(0, monthlyBudget - spentVal));
        setPercentage(Math.min(100, Math.round((spentVal / monthlyBudget) * 100)));
      } else {
        setRemaining(0);
        setPercentage(0);
      }

      const prog = await getBudgetProgress(month);
      setProgress(prog);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  const setBudgetAmount = useCallback(async (amount: number) => {
    await setMonthlyBudget(month, amount);
    await updateProfile({ monthly_budget: amount });
    await refresh();
  }, [month, refresh]);

  const clearBudget = useCallback(async () => {
    await removeBudget(month);
    await updateProfile({ monthly_budget: 0 });
    await refresh();
  }, [month, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { budget, spent, remaining, percentage, isLoading, progress, setBudgetAmount, clearBudget, refresh };
}
