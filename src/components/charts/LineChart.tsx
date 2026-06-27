import { View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useThemeColors } from '@/styles/global';

interface LineChartData {
  label: string;
  value: number;
  color?: string;
}

interface LineChartProps {
  data: LineChartData[];
  height: number;
  maxValue?: number;
  showLabels?: boolean;
  lineColor?: string;
}

export function LineChart({ data, height, maxValue, showLabels = true, lineColor }: LineChartProps) {
  const colors = useThemeColors();

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    value: d.value,
    label: showLabels ? d.label : undefined,
    dataPointText: '',
  }));

  const color = lineColor ?? colors.primary;

  return (
    <View className="items-center">
      <GiftedLineChart
        data={chartData}
        height={height}
        maxValue={maxValue}
        noOfSections={3}
        isAnimated
        color={color}
        thickness={2.5}
        startFillColor={color}
        endFillColor={color}
        startOpacity={0.15}
        endOpacity={0.02}
        areaChart
        curved
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
        hideDataPoints
        initialSpacing={10}
        endSpacing={10}
        spacing={Math.max(20, (260 - data.length * 8) / (data.length - 1 || 1))}
      />
    </View>
  );
}
