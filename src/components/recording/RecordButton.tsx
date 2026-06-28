import { View, Text, TouchableOpacity, I18nManager } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TFunction } from 'i18next';
import { formatNumber } from '@/services/format';

interface RecordButtonProps {
  onRecordStart: () => void;
  onSend: () => void;
  onCancel: () => void;
  onTogglePause: () => void;
  isRecording: boolean;
  isPaused: boolean;
  durationMillis: number;
  todayCount: number;
  atDailyLimit: boolean;
  isUnlimited: boolean;
  colors: Record<string, string>;
  t: TFunction;
}

const MAX_DAILY_RECORDINGS = 10;

export function RecordButton({
  onRecordStart,
  onSend,
  onCancel,
  onTogglePause,
  isRecording,
  isPaused,
  durationMillis,
  todayCount,
  atDailyLimit,
  isUnlimited,
  colors,
  t,
}: RecordButtonProps) {
  const lang = I18nManager.isRTL ? 'ar' : 'en';
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (atDailyLimit && !isRecording) {
    return (
      <View className="justify-end mt-auto items-center pt-16 border-t border-border">
        <View className="bg-muted rounded-full w-20 h-20 items-center justify-center">
          <Ionicons name="mic" size={36} color={colors.mutedForeground} />
        </View>
        <View className="mt-2 items-center">
          <Text className="text-sm text-destructive font-cairo-semibold text-center">
            {t('recordings.dailyLimit')}
          </Text>
        </View>
      </View>
    );
  }

  if (isRecording) {
    return (
      <View className="justify-end mt-auto items-center pt-6 border-t border-border">
        <View className="bg-surface-container-low rounded-2xl px-6 py-5 w-full mx-5 flex-row items-center justify-between">
          <TouchableOpacity className="items-center" activeOpacity={0.7} onPress={onCancel}>
            <View className="bg-destructive/15 rounded-full w-12 h-12 items-center justify-center">
              <Ionicons name="close" size={24} color={colors.destructive} />
            </View>
            <Text className="text-xs text-destructive font-cairo mt-1">{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" activeOpacity={0.7} onPress={onTogglePause}>
            <View className="bg-surface-bright rounded-full w-14 h-14 items-center justify-center">
              <Ionicons name={isPaused ? 'play' : 'pause'} size={28} color={colors.onSurface} />
            </View>
            <Text className="text-xs text-on-surface font-cairo mt-1">
              {formatTime(durationMillis)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" activeOpacity={0.7} onPress={onSend}>
            <View className="bg-primary rounded-full w-12 h-12 items-center justify-center">
              <Ionicons name="checkmark" size={24} color={colors.onPrimary} />
            </View>
            <Text className="text-xs text-foreground font-cairo mt-1">{t('recordings.send')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="justify-end mt-auto items-center pt-16 border-t border-border">
      <TouchableOpacity
        className="bg-primary rounded-full w-20 h-20 items-center justify-center"
        activeOpacity={0.8}
        onPress={onRecordStart}
      >
        <Ionicons name="mic" size={36} color={colors.onPrimary} />
      </TouchableOpacity>
      <Text className="text-sm text-muted-foreground text-center mt-2 font-cairo">
        {t('home.tapToRecord')}
      </Text>
      {!isRecording && !atDailyLimit && !isUnlimited && (
        <Text className="text-sm text-muted-foreground text-center mt-1 font-cairo-medium">
          {t('recordings.remaining', {
            count: formatNumber(MAX_DAILY_RECORDINGS - todayCount, lang),
          })}
        </Text>
      )}
    </View>
  );
}
