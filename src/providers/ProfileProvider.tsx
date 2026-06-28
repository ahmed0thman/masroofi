import React, { createContext, useContext, type ReactNode } from 'react';
import { useProfileData } from '@/hooks/useProfileData';
import type { Profile, CreateProfileInput } from '@/db/profile-repo';

export interface ProfileContextValue {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  createProfile: (input: CreateProfileInput) => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfileData();
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext must be used within ProfileProvider');
  return ctx;
}
