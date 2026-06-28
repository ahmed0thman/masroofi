import { recalculateMonthlySavings } from '@/db/saving-wallet-repo';
import { useProfileContext } from '@/providers/ProfileProvider';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useProfileEditor() {
  const { profile, updateProfile, isLoading, createProfile } = useProfileContext();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [currencyId, setCurrencyId] = useState<number>(1);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setGender(profile.gender ?? '');
      setLocation(profile.location ?? '');
      setAge(profile.age ? String(profile.age) : '');
      setAvatarUri(profile.avatar_uri ?? null);
      setCurrencyId(profile.currency_id ?? 1);
      setMonthlyBudget(profile.monthly_budget ? String(profile.monthly_budget) : '');
    }
  }, [profile]);

  const saveProfile = useCallback(async () => {
    setIsSaving(true);
    try {
      const budget = monthlyBudget ? parseFloat(monthlyBudget) : 0;

      await updateProfile({
        name,
        gender,
        location,
        age: age ? parseInt(age, 10) : 0,
        avatar_uri: avatarUri,
        currency_id: currencyId,
        monthly_budget: budget,
      });

      if (budget > 0) {
        await recalculateMonthlySavings(budget);
      }
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    } finally {
      setIsSaving(false);
    }
  }, [name, gender, location, age, avatarUri, currencyId, monthlyBudget, updateProfile, t]);

  return {
    name,
    gender,
    location,
    age,
    avatarUri,
    currencyId,
    monthlyBudget,
    setName,
    setGender,
    setLocation,
    setAge,
    setAvatarUri,
    setCurrencyId,
    setMonthlyBudget,
    saveProfile,
    isSaving,
    profile,
    isLoading,
    updateProfile,
    createProfile,
  };
}
