import { useState, useEffect, useCallback } from 'react';
import {
  getAllReminders,
  insertReminder,
  updateReminder,
  deleteReminder,
  type Reminder,
  type NewReminder,
} from '@/db/reminder-repo';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rows = await getAllReminders();
      setReminders(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addReminder = useCallback(async (reminder: NewReminder) => {
    try {
      await insertReminder(reminder);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reminder');
    }
  }, [refresh]);

  const toggleReminder = useCallback(async (id: number, enabled: boolean) => {
    try {
      await updateReminder(id, { enabled: enabled ? 1 : 0 });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reminder');
    }
  }, [refresh]);

  const deleteOne = useCallback(async (id: number) => {
    try {
      await deleteReminder(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder');
    }
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { reminders, isLoading, error, refresh, addReminder, toggleReminder, deleteReminder: deleteOne };
}
