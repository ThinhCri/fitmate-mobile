/**
 * CalorieRing — consumed/target progress.
 * Macros below ring.
 */
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { ProgressRing, ProgressBar } from '@/components/ui';

export interface CalorieRingProps {
  consumed: number;
  burned: number;
  target: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export function CalorieRing({ consumed, burned, target, protein, carbs, fat }: CalorieRingProps) {
  const theme = useTheme();
  const pct = target > 0 ? consumed / target : 0;
  const overTarget = consumed > target;
  const ringTone: 'primary' | 'secondary' | 'warning' | 'success' = overTarget ? 'warning' : 'primary';

  return (
    <Card variant="default">
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>Calories hôm nay</Text>
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <ProgressRing
          size={160}
          stroke={14}
          progress={Math.min(1, pct)}
          label={`${Math.round(consumed)}`}
          subLabel={`/ ${target} kcal`}
          tone={ringTone}
        />
      </View>
      <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, textAlign: 'center' }}>
        {overTarget ? `Vượt mục tiêu ${Math.round(consumed - target)} kcal` : `Đã đốt ${burned} kcal`}
      </Text>
      <View style={{ gap: 10, marginTop: 12 }}>
        <ProgressBar
          tone="primary"
          label="Protein"
          caption={`${protein.current} / ${protein.target} g`}
          progress={protein.target > 0 ? protein.current / protein.target : 0}
        />
        <ProgressBar
          tone="secondary"
          label="Carb"
          caption={`${carbs.current} / ${carbs.target} g`}
          progress={carbs.target > 0 ? carbs.current / carbs.target : 0}
        />
        <ProgressBar
          tone="primary"
          label="Fat"
          caption={`${fat.current} / ${fat.target} g`}
          progress={fat.target > 0 ? fat.current / fat.target : 0}
        />
      </View>
    </Card>
  );
}
