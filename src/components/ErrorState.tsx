import { View, Pressable, Text } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text className="text-sm text-muted-foreground text-center mt-4 font-cairo">{message}</Text>
      {onRetry && (
        <Pressable className="mt-4 px-6 py-3 rounded-xl bg-primary" onPress={onRetry}>
          <Text className="text-on-primary font-cairo-semibold text-base">{t('common.retry')}</Text>
        </Pressable>
      )}
    </View>
  );
}
