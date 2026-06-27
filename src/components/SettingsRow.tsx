import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import { I18nManager, Pressable, Text, View } from 'react-native';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
}

export function SettingsRow({ icon, label, value, onPress, isLast }: SettingsRowProps) {
  const colors = useThemeColors();

  return (
    <Pressable onPress={onPress} className="active:opacity-70">
      <View className="px-4 py-3.5 flex-row items-center justify-between" style={{ minHeight: 52 }}>
        <View className="flex-row items-center gap-3 flex-1">
          <Ionicons name={icon} size={22} color={colors.secondaryContainer} />
          <View className="flex-1 items-start">
            <Text className="text-on-surface font-cairo">{label}</Text>
            {value ? (
              <Text className="text-xs text-muted-foreground font-cairo mt-0.5">{value}</Text>
            ) : null}
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.mutedForeground}
          style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
        />
      </View>
      {!isLast ? <View className="border-b border-outline-variant ml-14" /> : null}
    </Pressable>
  );
}
