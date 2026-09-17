/**
 * Progress ring (SVG) — token semantic, light theme (no neon glow).
 * Tren surface track / primary fill.
 */
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface ProgressRingProps {
  size?: number;
  stroke?: number;
  /** 0..1 */
  progress: number;
  /** Center label (e.g. "65%") */
  label?: string;
  /** Sub-label under main label */
  subLabel?: string;
  /** tone of fill (primary | secondary | tertiary) */
  tone?: 'primary' | 'secondary' | 'tertiary';
}

export function ProgressRing({
  size = 140,
  stroke = 12,
  progress,
  label,
  subLabel,
  tone = 'primary',
}: ProgressRingProps) {
  const theme = useTheme();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);

  const fillKey = tone === 'secondary' ? 'secondary' : tone === 'tertiary' ? 'tertiary' : 'primary';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolveColor(theme, 'surfaceContainerHigh')}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolveColor(theme, fillKey)}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {(label || subLabel) && (
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          {label && (
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 28, fontWeight: '800' }}>{label}</Text>
          )}
          {subLabel && (
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }}>{subLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}
