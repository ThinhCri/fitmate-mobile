/**
 * BarChart (SVG) — bar chart cho revenue timeline.
 * Tu implement bang react-native-svg (san co) de:
 *  - Khong them dependency moi.
 *  - Tuong thich Android tot.
 *  - Ho tro negative values (refund).
 *  - Tap xem chi tiet tung cot (touch friendly, khong phu thuoc hover).
 *  - Empty state va accessibility label.
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface BarChartPoint {
  label: string;
  period: string;
  /** Gia tri (VND). Co the am. */
  value: number;
}

export interface BarChartProps {
  data: BarChartPoint[];
  /** Chieu cao bieu do (px). */
  height?: number;
  /** Tieu de. */
  title?: string;
  /** Don vi hien thi (VND). */
  unit?: string;
  /** Ham format so (mac dinh: 1.234.567). */
  formatValue?: (v: number) => string;
  /** Thong bao khi khong co du lieu. */
  emptyText?: string;
  /** Label truy cap (a11y). */
  accessibilityLabel?: string;
}

const formatVND = (v: number): string => {
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${formatted}`;
};

export function BarChart({
  data,
  height = 180,
  title,
  unit = 'VND',
  formatValue = formatVND,
  emptyText = 'Chưa có dữ liệu trong khoảng thời gian này.',
  accessibilityLabel,
}: BarChartProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<number | null>(null);

  const maxAbs = Math.max(1, ...data.map((p) => Math.abs(p.value)));
  const barCount = Math.max(data.length, 1);
  const paddingX = 8;
  const paddingY = 24;
  const width = 320; // SVG width — giu ti le qua viewBox, scale theo container.
  const chartHeight = height - paddingY;
  const midY = chartHeight / 2;

  // Render bars
  const barWidth = (width - paddingX * 2) / barCount - 2;
  const zeroLineY = midY; // baseline o giua (cho negative)

  return (
    <View accessibilityLabel={accessibilityLabel ?? title}>
      {title ? (
        <Text style={{ fontSize: 14, fontWeight: '600', color: resolveColor(theme, 'onSurface'), marginBottom: 8 }}>
          {title}
        </Text>
      ) : null}

      {data.length === 0 || data.every((p) => p.value === 0) ? (
        <View
          style={{
            height,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
            borderRadius: 12,
          }}
        >
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>
            {emptyText}
          </Text>
        </View>
      ) : (
        <View>
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${chartHeight + 20}`}>
            {/* Baseline */}
            <Line
              x1={paddingX}
              x2={width - paddingX}
              y1={zeroLineY}
              y2={zeroLineY}
              stroke={resolveColor(theme, 'outlineVariant')}
              strokeWidth={1}
            />

            {data.map((p, i) => {
              const x = paddingX + i * ((width - paddingX * 2) / barCount) + 1;
              const ratio = Math.abs(p.value) / maxAbs;
              const barHeight = Math.max(2, ratio * (chartHeight / 2 - 4));
              const y = p.value >= 0 ? zeroLineY - barHeight : zeroLineY;
              const color =
                p.value >= 0
                  ? resolveColor(theme, 'primary')
                  : resolveColor(theme, 'error');
              const isSelected = selected === i;
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={Math.max(2, barWidth)}
                  height={barHeight}
                  fill={color}
                  opacity={isSelected ? 1 : 0.85}
                  rx={2}
                />
              );
            })}
          </Svg>

          {/* X-axis labels (render ngoai SVG de dung font he thong) */}
          <View style={{ flexDirection: 'row', paddingHorizontal: paddingX, marginTop: 4 }}>
            {data.map((p, i) => (
              <Pressable
                key={i}
                onPress={() => setSelected(selected === i ? null : i)}
                accessibilityRole="button"
                accessibilityLabel={`${p.label}: ${formatValue(p.value)} ${unit}`}
                style={{
                  width: `${100 / barCount}%`,
                  alignItems: 'center',
                  paddingVertical: 2,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 10,
                    color:
                      selected === i
                        ? resolveColor(theme, 'primary')
                        : resolveColor(theme, 'onSurfaceVariant'),
                    fontWeight: selected === i ? '700' : '500',
                  }}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Selected value display */}
          {selected !== null && data[selected] ? (
            <View
              style={{
                marginTop: 8,
                padding: 8,
                borderRadius: 8,
                backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
                {data[selected].label}
              </Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '700' }}>
                {formatValue(data[selected].value)} {unit}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
