import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/hooks/useBudget';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getProfile, updateProfile } from '@/db/profile-repo';
import { ProgressBar } from '@/components/charts/ProgressBar';
import { formatCurrency } from '@/services/format';

function getDayLabel(d: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d] ?? 'Friday';
}

export function BudgetGoalSection() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const { budget, spent, remaining, percentage, isLoading, progress, setBudgetAmount, clearBudget, refresh: refreshBudget } = useBudget();
  const { goals, isLoading: goalsLoading, createGoal, updateGoal, deleteGoal, refresh: refreshGoals } = useSavingsGoals();

  const [showBudgetSheet, setShowBudgetSheet] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [analyticsDay, setAnalyticsDay] = useState(5);

  const refreshDay = useCallback(async () => {
    const profile = await getProfile();
    if (profile) setAnalyticsDay(profile.analytics_day ?? 5);
  }, []);

  const handleOpenBudgetSheet = useCallback(async () => {
    await refreshDay();
    setBudgetInput(budget > 0 ? String(budget) : '');
    setShowBudgetSheet(true);
  }, [budget, refreshDay]);

  const handleSaveBudget = useCallback(async () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount < 0) return;
    if (amount === 0) {
      await clearBudget();
    } else {
      await setBudgetAmount(amount);
    }
    setShowBudgetSheet(false);
  }, [budgetInput, clearBudget, setBudgetAmount]);

  const handleOpenGoalSheet = useCallback(() => {
    setGoalName('');
    setGoalTarget('');
    setShowGoalSheet(true);
  }, []);

  const handleCreateGoal = useCallback(async () => {
    if (!goalName.trim()) return;
    const target = parseFloat(goalTarget);
    if (isNaN(target) || target <= 0) return;
    await createGoal({ name: goalName.trim(), targetAmount: target });
    setShowGoalSheet(false);
  }, [goalName, goalTarget, createGoal]);

  const handleDeleteGoal = useCallback((id: number, name: string) => {
    Alert.alert(t('common.delete'), `${t('common.delete')} "${name}"?`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  }, [deleteGoal, t]);

  const handleDayChange = useCallback(async (day: number) => {
    setAnalyticsDay(day);
    setShowDayPicker(false);
    await updateProfile({ analytics_day: day } as any);
  }, []);

  return (
    <>
      {/* Monthly Budget */}
      <TouchableOpacity onPress={handleOpenBudgetSheet} className="mx-5 mb-4">
        <View className="bg-surface-bright rounded-[20px] p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
              <Text className="font-cairo-semibold text-on-surface">{t('settings.budget')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
          </View>
          {budget > 0 ? (
            <>
              <Text className="font-cairo-bold text-2xl text-primary">{formatCurrency(budget)}</Text>
              <ProgressBar value={spent} max={budget} height={6} />
              <View className="flex-row justify-between mt-1">
                <Text className="font-cairo text-xs text-muted-foreground">
                  {t('analytics.totalSpent')}: {formatCurrency(spent)}
                </Text>
                <Text className="font-cairo text-xs" style={{ color: remaining > 0 ? colors.success : colors.destructive }}>
                  {remaining > 0 ? `${t('analytics.budgetRemaining')}: ${formatCurrency(remaining)}` : `${t('analytics.budgetOverspent')}: ${formatCurrency(Math.abs(remaining))}`}
                </Text>
              </View>
              {progress.filter(p => p.categoryId !== null).map((p, idx) => (
                <View key={idx} className="mt-2 flex-row items-center gap-2">
                  <Text className="font-cairo text-xs text-muted-foreground flex-1">{p.categoryName}</Text>
                  <Text className="font-cairo text-xs text-muted-foreground">{formatCurrency(p.spent)}/{formatCurrency(p.budget)}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text className="font-cairo text-muted-foreground">{t('settings.budgetDesc')}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Analytics Scheduler */}
      <TouchableOpacity onPress={() => { refreshDay(); setShowDayPicker(true); }} className="mx-5 mb-4">
        <View className="bg-surface-bright rounded-[20px] p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text className="font-cairo-semibold text-on-surface">{t('settings.analyticsScheduler')}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="font-cairo text-muted-foreground">{getDayLabel(analyticsDay)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Savings Goals */}
      <View className="mx-5 mb-4">
        <View className="bg-surface-bright rounded-[20px] p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="flag-outline" size={20} color={colors.primary} />
              <Text className="font-cairo-semibold text-on-surface">{t('settings.savingGoal')}</Text>
            </View>
            <TouchableOpacity onPress={handleOpenGoalSheet}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {goals.length === 0 ? (
            <Text className="font-cairo text-muted-foreground">{t('settings.savingGoalDesc')}</Text>
          ) : (
            goals.map((goal) => {
              const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
              return (
                <View key={goal.id} className="mb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-cairo-medium text-on-surface">{goal.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteGoal(goal.id, goal.name)}>
                      <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                  <ProgressBar value={goal.current_amount} max={goal.target_amount} height={6} />
                  <View className="flex-row justify-between mt-1">
                    <Text className="font-cairo text-xs text-muted-foreground">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </Text>
                    <Text className="font-cairo text-xs text-muted-foreground">{pct}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Budget Bottom Sheet */}
      <BottomSheet visible={showBudgetSheet} onClose={() => setShowBudgetSheet(false)} title={t('settings.budget')}>
        <TextInput
          className="bg-surface-container-high rounded-xl px-4 py-3 font-cairo text-on-surface text-lg text-center"
          placeholder={t('settings.budgetPlaceholder')}
          placeholderTextColor={colors.onSurfaceVariant}
          value={budgetInput}
          onChangeText={setBudgetInput}
          keyboardType="decimal-pad"
          autoFocus
        />
        <View className="flex-row gap-3 mt-4">
          <Button variant="outline" className="flex-1" onPress={() => setShowBudgetSheet(false)}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" onPress={handleSaveBudget}>
            {t('common.save')}
          </Button>
        </View>
      </BottomSheet>

      {/* Goal Bottom Sheet */}
      <BottomSheet visible={showGoalSheet} onClose={() => setShowGoalSheet(false)} title={t('settings.savingGoal')}>
        <TextInput
          className="bg-surface-container-high rounded-xl px-4 py-3 font-cairo text-on-surface mb-3"
          placeholder={t('settings.savingGoalName')}
          placeholderTextColor={colors.onSurfaceVariant}
          value={goalName}
          onChangeText={setGoalName}
        />
        <TextInput
          className="bg-surface-container-high rounded-xl px-4 py-3 font-cairo text-on-surface mb-4"
          placeholder={t('settings.savingGoalTarget')}
          placeholderTextColor={colors.onSurfaceVariant}
          value={goalTarget}
          onChangeText={setGoalTarget}
          keyboardType="decimal-pad"
        />
        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-1" onPress={() => setShowGoalSheet(false)}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" onPress={handleCreateGoal}>
            {t('common.save')}
          </Button>
        </View>
      </BottomSheet>

      {/* Day Picker Bottom Sheet */}
      <BottomSheet visible={showDayPicker} onClose={() => setShowDayPicker(false)} title={t('settings.analyticsScheduler')}>
        <View className="gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => handleDayChange(day)}
              className={`p-3 rounded-xl ${analyticsDay === day ? 'bg-primary' : 'bg-surface-container-high'}`}
            >
              <Text className={`font-cairo text-center ${analyticsDay === day ? 'text-on-primary' : 'text-on-surface'}`}>
                {i18n.language === 'ar'
                  ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][day]
                  : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}
