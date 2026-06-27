import { View, Text } from 'react-native';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ value, max, color, height = 8, showLabel = true }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = color ?? (percentage >= 100 ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#166a59');

  return (
    <View className="w-full">
      <View className="w-full bg-surface-container-high rounded-full overflow-hidden" style={{ height }}>
        <View
          className="rounded-full"
          style={{
            width: `${percentage}%`,
            height,
            backgroundColor: barColor,
          }}
        />
      </View>
      {showLabel && (
        <Text className="font-cairo text-xs text-muted-foreground mt-1">
          {percentage}%
        </Text>
      )}
    </View>
  );
}
