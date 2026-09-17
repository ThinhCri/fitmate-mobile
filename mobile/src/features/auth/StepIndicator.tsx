/**
 * StepIndicator — hiển thị 1..N trong onboarding/register flow.
 */
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Check } from 'lucide-react-native';

export interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 }}>
      {steps.map((label, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const bg = isDone || isCurrent ? resolveColor(theme, 'primary') : resolveColor(theme, 'surfaceContainerHigh');
        const fg = isDone || isCurrent ? '#fff' : resolveColor(theme, 'onSurfaceVariant');
        return (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDone ? <Check color="#fff" size={12} /> : <Text style={{ color: fg, fontSize: 10, fontWeight: '700' }}>{idx + 1}</Text>}
            </View>
            <Text style={{ color: isCurrent ? resolveColor(theme, 'onSurface') : resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, fontWeight: isCurrent ? '700' : '400' }}>
              {label}
            </Text>
            {idx < steps.length - 1 && (
              <View style={{ width: 18, height: 1, backgroundColor: resolveColor(theme, 'outlineVariant'), marginHorizontal: 2 }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default StepIndicator;
