import { useState, useCallback } from 'react';
import {
  getFilteredExpenses,
  getFilteredExpensesCount,
  getDistinctMainCategories,
  getDistinctSubCategories,
  type ExpenseRow,
  type ExpenseFilters,
} from '@/db/expense-repo';

const PAGE_SIZE = 20;

export function useFilteredExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ExpenseFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const loadInitial = useCallback(async (newFilters: ExpenseFilters) => {
    setIsLoading(true);
    setError(null);
    setFiltersState(newFilters);
    setPage(0);
    try {
      const [cats, subs, count, data] = await Promise.all([
        getDistinctMainCategories(),
        getDistinctSubCategories(newFilters.main_category),
        getFilteredExpensesCount(newFilters),
        getFilteredExpenses(newFilters, PAGE_SIZE, 0),
      ]);
      setCategories(cats);
      setSubCategories(subs);
      setTotalCount(count);
      setExpenses(data);
      setHasMore(data.length >= PAGE_SIZE && data.length < count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      const data = await getFilteredExpenses(filters, PAGE_SIZE, nextPage * PAGE_SIZE);
      setExpenses((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [filters, hasMore, isLoading, page]);

  const applyFilters = useCallback(
    (newFilters: ExpenseFilters) => {
      loadInitial(newFilters);
    },
    [loadInitial],
  );

  const refresh = useCallback(() => {
    loadInitial(filters);
  }, [loadInitial, filters]);

  return {
    expenses,
    totalCount,
    isLoading,
    error,
    hasMore,
    categories,
    subCategories,
    filters,
    applyFilters,
    loadMore,
    refresh,
  };
}
