import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ProgressBar } from '@/components/charts/ProgressBar';
import { Button } from '@/components/ui/button';
import { formatFullCurrency } from '@/services/format';
import { Input } from '@/components/ui/input';
import { getDefaultCurrency, type CurrencyRow } from '@/db/currency-repo';

export function SavingsGoalsCard() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const { goals, createGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const [currency, setCurrency] = useState<CurrencyRow | null>(null);

  useEffect(() => {
    getDefaultCurrency().then(setCurrency);
  }, []);

  const locale = i18n.language;

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const startCreating = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewName('');
    setNewTarget('');
    setCreating(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const target = parseFloat(newTarget);
    if (isNaN(target) || target <= 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await createGoal({ name: newName.trim(), targetAmount: target });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCreating(false);
  }, [newName, newTarget, createGoal]);

  const startEditing = useCallback((goal: (typeof goals)[0]) => {
    setEditingId(goal.id);
    setEditName(goal.name);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editName.trim() || editingId === null) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateGoal(editingId, { name: editName.trim() });
    setEditingId(null);
  }, [editName, editingId, updateGoal]);

  const handleDeleteGoal = useCallback(
    (id: number, name: string) => {
      Alert.alert(t('common.delete'), `${t('common.delete')} "${name}"?`, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteGoal(id) },
      ]);
    },
    [t, deleteGoal],
  );

  return (
    <View className="bg-surface-container rounded-3xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="flag-outline" size={20} color={colors.primary} />
          <Text className="font-cairo-semibold text-on-surface">{t('settings.savingGoal')}</Text>
        </View>
        {!creating && (
          <Button
            variant="ghost"
            size="sm"
            onPress={startCreating}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.primary} />}
          />
        )}
      </View>

      {creating && (
        <View className="gap-3 bg-surface-container-low rounded-2xl p-4">
          <Input
            className="bg-surface rounded-xl px-4 py-3 font-cairo text-on-surface text-base"
            placeholder={t('settings.savingGoalName')}
            placeholderTextColor={colors.onSurfaceVariant}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <Input
            className="bg-surface rounded-xl px-4 py-3 font-cairo text-on-surface text-base"
            placeholder={t('settings.savingGoalTarget')}
            placeholderTextColor={colors.onSurfaceVariant}
            value={newTarget}
            onChangeText={setNewTarget}
            keyboardType="decimal-pad"
          />
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setCreating(false)}
              className="flex-1 py-3 rounded-xl items-center bg-surface-container-high"
            >
              <Text className="font-cairo text-on-surface">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              className="flex-1 py-3 rounded-xl items-center bg-primary"
            >
              <Text className="font-cairo-semibold text-on-primary">{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {goals.length === 0 && !creating ? (
        <View className="items-center gap-3 py-6">
          <Ionicons name="flag-outline" size={48} color={colors.onSurfaceVariant} />
          <Text className="font-cairo-semibold text-base text-on-surface">
            {t('settings.savingGoalEmptyTitle')}
          </Text>
          <Text className="font-cairo text-sm text-on-surface-variant text-center">
            {t('settings.savingGoalEmptyDesc')}
          </Text>
          <Button className="mt-2" onPress={startCreating}>
            {t('settings.savingGoalCreateFirst')}
          </Button>
        </View>
      ) : (
        <View className="gap-3">
          {goals.map((goal) => {
            const isEditing = editingId === goal.id;
            const pct =
              goal.target_amount > 0
                ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                : 0;

            return (
              <View key={goal.id} className="bg-surface-container-low rounded-2xl p-4 gap-3">
                <View className="flex-row items-center justify-between">
                  {isEditing ? (
                    <Input
                      className="flex-1 bg-surface rounded-xl px-3 py-2 font-cairo text-on-surface text-base"
                      value={editName}
                      onChangeText={setEditName}
                    />
                  ) : (
                    <Text className="font-cairo-semibold text-base text-on-surface flex-1">
                      {goal.name}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-1">
                    {isEditing ? (
                      <>
                        <TouchableOpacity onPress={() => setEditingId(null)} className="p-2">
                          <Ionicons
                            name="close-outline"
                            size={18}
                            color={colors.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveEdit} className="p-2">
                          <Ionicons name="checkmark-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => startEditing(goal)} className="p-2">
                          <Ionicons
                            name="pencil-outline"
                            size={16}
                            color={colors.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteGoal(goal.id, goal.name)}
                          className="p-2"
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                <View>
                  <ProgressBar
                    value={goal.current_amount}
                    max={goal.target_amount}
                    height={8}
                    color={colors.secondary}
                    showLabel={false}
                  />
                  <Text className="font-cairo text-xs text-secondary mt-1">{pct}%</Text>
                </View>

                <Text className="font-cairo text-lg text-on-surface-variant">
                  {currency ? formatFullCurrency(goal.current_amount, currency, locale) : goal.current_amount} /{' '}
                  {currency ? formatFullCurrency(goal.target_amount, currency, locale) : goal.target_amount}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
