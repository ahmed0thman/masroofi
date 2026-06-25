import { Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';

export function useProfileEditor() {
  const { profile, updateProfile, isLoading } = useProfile();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setGender(profile.gender ?? '');
      setLocation(profile.location ?? '');
      setAge(profile.age ? String(profile.age) : '');
      setAvatarUri(profile.avatar_uri ?? null);
    }
  }, [profile]);

  const saveProfile = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        gender,
        location,
        age: age ? parseInt(age, 10) : 0,
        avatar_uri: avatarUri,
      });
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    } finally {
      setIsSaving(false);
    }
  }, [name, gender, location, age, avatarUri, updateProfile, t]);

  return {
    name,
    gender,
    location,
    age,
    avatarUri,
    setName,
    setGender,
    setLocation,
    setAge,
    setAvatarUri,
    saveProfile,
    isSaving,
    profile,
    isLoading,
    updateProfile,
  };
}
