import { View, Pressable, Switch } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/styles/global';
import { Text } from 'react-native';

interface ReminderCardProps {
  time: string;
  meridiem: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}

export function ReminderCard({ time, meridiem, enabled, onToggle, onDelete }: ReminderCardProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-1.5 bg-surface-container-low rounded-full px-4 py-3 border border-outline">
      <Ionicons name="time-outline" size={24} color={colors.surfaceTint} />
      <Text className="font-cairo-medium text-lg leading-8 text-foreground">
        {time} {meridiem}
      </Text>

      <Switch
        className="ms-auto"
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.outlineVariant, true: colors.secondary }}
        thumbColor={enabled ? colors.onPrimary : colors.surfaceContainerHighest}
      />
      <Pressable onPress={onDelete} hitSlop={8} className="p-0.5">
        <Ionicons name="trash" size={20} color={colors.destructive} />
      </Pressable>
    </View>
  );
}
