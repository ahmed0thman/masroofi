import { View } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { useThemeColors } from '@/styles/global';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height: number;
  maxValue?: number;
  showLabels?: boolean;
  barColor?: string;
}

export function BarChart({ data, height, maxValue, showLabels = true, barColor }: BarChartProps) {
  const colors = useThemeColors();

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    value: d.value,
    frontColor: d.color ?? barColor ?? colors.primary,
    label: showLabels ? d.label : undefined,
  }));

  return (
    <View className="items-center">
      <GiftedBarChart
        data={chartData}
        height={height}
        maxValue={maxValue}
        barWidth={Math.max(12, Math.min(36, (280 - data.length * 4) / data.length))}
        spacing={Math.max(2, Math.min(12, (280 - data.length * 12) / (data.length + 1)))}
        noOfSections={3}
        isAnimated
        yAxisTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10, fontFamily: 'Cairo-Regular' }}
        xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10, fontFamily: 'Cairo-Regular' }}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={colors.outlineVariant}
        rulesColor={colors.surfaceContainerHigh}
        rulesThickness={1}
        showYAxisIndices={false}
        showXAxisIndices={false}
        hideYAxisText={true}
        barBorderRadius={4}
        showGradient={false}
        opacity={0.85}
        initialSpacing={10}
        endSpacing={10}
      />
    </View>
  );
}
