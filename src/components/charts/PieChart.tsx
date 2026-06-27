import { View, Text } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size: number;
  innerRadius?: number;
  showLegend?: boolean;
}

export function PieChart({ data, size, innerRadius, showLegend = true }: PieChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const chartData = data.map((d) => ({
    value: d.value,
    color: d.color,
    text: `${Math.round((d.value / total) * 100)}%`,
  }));

  const radius = size / 2;

  return (
    <View className="items-center bg-transparent">
      <GiftedPieChart
        data={chartData}
        radius={radius}
        donut={!!innerRadius && innerRadius > 0}
        innerRadius={innerRadius && innerRadius > 0 ? innerRadius : undefined}
        isAnimated
        backgroundColor="transparent"
      />
      {showLegend && (
        <View className="w-full mt-4 gap-2">
          {data.map((d, idx) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <View key={idx} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <Text className="font-cairo text-sm text-on-surface">{d.label}</Text>
                </View>
                <Text className="font-cairo-medium text-sm text-on-surface-variant">
                  {pct}% — {d.value.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
