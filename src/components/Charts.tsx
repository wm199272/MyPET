import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { Figure } from '@/src/components/ui';
import { WeightRecord, WeightUnit, kgToDisplay } from '@/src/domain';
import { colors } from '@/src/theme';

export function WeightChart({ points, unit }: { points: WeightRecord[]; unit: WeightUnit }) {
  if (points.length < 2) {
    return <DashedEmpty text="记到两次体重后显示曲线" />;
  }
  const width = 320;
  const height = 188;
  const padX = 28;
  const padTop = 30;
  const padBottom = 16;
  const values = points.map((point) => point.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : padX + (index * (width - padX * 2)) / (points.length - 1);
    const y = padTop + (1 - (point.weightKg - min) / span) * (height - padTop - padBottom);
    return { x, y };
  });
  const poly = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const latest = points[points.length - 1];
  const highest = points.reduce((best, point) => (point.weightKg > best.weightKg ? point : best), points[0]);
  const lowest = points.reduce((best, point) => (point.weightKg < best.weightKg ? point : best), points[0]);
  const marked = new Set([latest.id, highest.id, lowest.id]);
  const unitLabel = unit === 'jin' ? '斤' : '公斤';
  const plotTop = padTop;
  const plotBottom = height - padBottom;
  const grid = [0.25, 0.5, 0.75].map((ratio) => plotTop + ratio * (plotBottom - plotTop));

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {grid.map((y) => (
          <Line key={y} x1={padX} x2={width - padX} y1={y} y2={y} stroke={colors.line} strokeWidth={1} />
        ))}
        <Polyline points={poly} fill="none" stroke={colors.primary} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((point, index) => {
          const value = kgToDisplay(points[index].weightKg, unit).toFixed(1);
          const labelY = point.y - 14;
          return (
            <G key={points[index].id}>
              <SvgText x={point.x} y={labelY} fill={colors.text} fontSize="11" fontWeight="500" textAnchor="middle">
                {value}
              </SvgText>
              <Circle
                cx={point.x}
                cy={point.y}
                r={marked.has(points[index].id) ? 4.5 : 3.5}
                fill={marked.has(points[index].id) ? colors.primary : colors.card}
                stroke={colors.primary}
                strokeWidth={1.5}
              />
            </G>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        <Legend label="最近" kg={latest.weightKg} unit={unit} unitLabel={unitLabel} />
        <Legend label="最高" kg={highest.weightKg} unit={unit} unitLabel={unitLabel} />
        <Legend label="最低" kg={lowest.weightKg} unit={unit} unitLabel={unitLabel} />
      </View>
    </View>
  );
}

export function DashedEmpty({ text }: { text: string }) {
  return (
    <View style={styles.dashed}>
      <Text style={styles.empty}>{text}</Text>
    </View>
  );
}

function Legend({ label, kg, unit, unitLabel }: { label: string; kg: number; unit: WeightUnit; unitLabel: string }) {
  return (
    <Text style={styles.legendText}>
      {label} <Figure value={kgToDisplay(kg, unit).toFixed(1)} unit={unitLabel} />
    </Text>
  );
}

export function MonthBars({ months }: { months: { label: string; total: number }[] }) {
  const max = Math.max(...months.map((month) => month.total), 1);
  return (
    <View style={styles.bars}>
      {months.map((month) => (
        <View key={month.label} style={styles.barCol}>
          <View style={styles.barTrack}>
            <View style={[styles.bar, { height: Math.max(6, (month.total / max) * 110) }]} />
          </View>
          <Text style={styles.barLabel}>{month.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 16,
    minHeight: 148,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  legendText: { color: colors.textSecondary, fontSize: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { height: 120, justifyContent: 'flex-end' },
  bar: { width: 16, borderRadius: 8, backgroundColor: colors.primary },
  barLabel: { marginTop: 8, fontSize: 12, color: colors.textSecondary },
});
