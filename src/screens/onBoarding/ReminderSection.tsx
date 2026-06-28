import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { useThemeColors } from '@/styles/global';

interface ReminderSectionProps {
  reminders: string[];
  onAddReminder: () => void;
  onRemoveReminder: (time: string) => void;
  maxReminders: number;
  notifDenied?: boolean;
}

const ReminderSection: React.FC<ReminderSectionProps> = ({
  reminders,
  onAddReminder,
  onRemoveReminder,
  maxReminders,
  notifDenied = false,
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const canAdd = reminders.length < maxReminders;

  return (
    <View className="w-full">
      {/* Section Header */}
      <View className="flex-row items-center gap-2 mb-1">
        <Ionicons name="notifications-outline" size={20} color={colors.secondary} />
        <Text className="font-cairo-semibold text-base text-foreground">
          {t('onboarding.reminder.title')}
        </Text>
      </View>

      <Text className="font-cairo text-sm text-muted-foreground mb-4">
        {t('onboarding.reminder.description')}
      </Text>

      {/* Reminder Pills */}
      {reminders.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {reminders.map((time, index) => (
            <View
              key={index}
              className="flex-row items-center gap-1.5 bg-surface-container-low rounded-full pl-3 pr-1.5 py-1.5 border border-outline"
            >
              <Ionicons name="time-outline" size={14} color={colors.secondary} />
              <Text className="font-cairo-medium text-sm text-foreground">{time}</Text>
              <Pressable
                onPress={() => onRemoveReminder(time)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="p-0.5"
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.reminder.remove')}
              >
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Add Reminder Button */}
      {canAdd ? (
        <Pressable
          className="flex-row items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-outline bg-transparent active:opacity-70"
          onPress={onAddReminder}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.reminder.add')}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.secondary} />
          <Text className="font-cairo-medium text-sm text-primary">
            {t('onboarding.reminder.add')}
          </Text>
        </Pressable>
      ) : (
        <Text className="font-cairo text-xs text-muted-foreground text-center">
          {t('onboarding.reminder.maxReached')}
        </Text>
      )}

      {/* Notification Denied Message */}
      {notifDenied && (
        <View className="mt-2 flex-row items-center gap-1.5">
          <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
          <Text className="font-cairo text-xs text-muted-foreground flex-1">
            {t('onboarding.reminder.notifDenied')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReminderSection;
