import {
  createProfile,
  getProfile,
  Profile,
  updateProfile,
  type CreateProfileInput,
} from '@/db/profile-repo';
import { useCallback, useEffect, useState } from 'react';

export function useProfileData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const p = await getProfile();
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(
    async (updates: Partial<Profile>) => {
      await updateProfile(updates);
      await refresh();
    },
    [refresh],
  );

  const create = useCallback(async (input: CreateProfileInput): Promise<Profile | null> => {
    console.log('hey');
    try {
      const p = await createProfile(input);
      console.log('profile created', p);
      await refresh();
      setProfile(p);
      return p;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      console.error('Failed to create profile', err);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, isLoading, error, refresh, updateProfile: update, createProfile: create };
}
