/**
 * Progress bar (linear) — height 8dp, rounded.
 * Protein/Carb/Fat macro bars.
 */
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  /** Color tone (primary | secondary | tertiary) */
  tone?: 'primary' | 'secondary' | 'tertiary';
  /** Optional label on top */
  label?: string;
  /** Right side caption (e.g. "120 / 180 g") */
  caption?: string;
}

export function ProgressBar({ progress, tone = 'primary', label, caption }: ProgressBarProps) {
  const theme = useTheme();
  const fillKey = tone === 'secondary' ? 'secondary' : tone === 'tertiary' ? 'tertiary' : 'primary';
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ gap: 4 }}>
      {(label || caption) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {label && <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '600' }}>{label}</Text>}
          {caption && <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{caption}</Text>}
        </View>
      )}
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: resolveColor(theme, 'surfaceContainerHigh'),
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped * 100}%`,
            height: '100%',
            backgroundColor: resolveColor(theme, fillKey),
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}
