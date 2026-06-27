import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text as UIText } from '@/components/ui/text';
import type { TFunction } from 'i18next';

interface RecordingHintsProps {
  colors: Record<string, string>;
  t: TFunction;
}

export function RecordingHints({ colors, t }: RecordingHintsProps) {
  return (
    <View className="bg-surface-container-low rounded-2xl p-4 mt-2">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="bulb-outline" size={22} color={colors.secondary} />
        <UIText className="text-base font-cairo-bold text-on-surface">
          {t('recordings.tips.title')}
        </UIText>
      </View>
      <View className="flex-row items-start gap-3 mb-3">
        <Ionicons name="mic-outline" size={18} color={colors.onSurfaceVariant} />
        <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
          {t('recordings.tips.itemAndPrice')}
        </UIText>
      </View>
      <View className="flex-row items-start gap-3 mb-3">
        <Ionicons name="pricetags-outline" size={18} color={colors.onSurfaceVariant} />
        <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
          {t('recordings.tips.mentionCategory')}
        </UIText>
      </View>
      <View className="flex-row items-start gap-3 mb-3">
        <Ionicons name="home-outline" size={18} color={colors.onSurfaceVariant} />
        <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
          {t('recordings.tips.mentionContext')}
        </UIText>
      </View>
      <View className="flex-row items-start gap-3 mb-3">
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={18}
          color={colors.onSurfaceVariant}
        />
        <View className="bg-surface-container-high rounded-xl p-3 flex-1">
          <UIText className="text-sm text-foreground font-cairo-semibold">
            {t('recordings.tips.example')}
          </UIText>
        </View>
      </View>
      <View className="flex-row items-start gap-3">
        <Ionicons name="ear-outline" size={18} color={colors.onSurfaceVariant} />
        <UIText className="text-sm text-on-surface-variant font-cairo flex-1">
          {t('recordings.tips.avoidNoise')}
        </UIText>
      </View>
    </View>
  );
}
