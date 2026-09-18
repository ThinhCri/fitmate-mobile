/**
 * WorkoutItem — 1 exercise with completion checkbox + at-a-glance summary.
 * FP-017.
 *
 * Display rule:
 *  - type === 'reps'  → render `sets × reps reps`
 *  - type === 'time'  → render `sets × {mm:ss}` (do NOT pretend it's reps)
 * Rest is rendered as `restSec`; calories as `calories`.
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, Circle, Dumbbell } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card } from '@/components/ui';
import type { Exercise } from '@/types';

export interface WorkoutItemProps {
  exercise: Exercise;
  index: number;
  onToggleComplete?: () => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m <= 0) return `${s}s`;
  if (s === 0) return `${m}:00`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function WorkoutItem({ exercise, index, onToggleComplete }: WorkoutItemProps) {
  const theme = useTheme();
  const [completed, setCompleted] = useState(false);

  const handlePress = () => {
    setCompleted((c) => !c);
    onToggleComplete?.();
  };

  const detail =
    exercise.type === 'time'
      ? `${exercise.sets} hiệp × ${formatDuration(exercise.durationSec ?? 0)} • Nghỉ ${exercise.restSec}s • ~${exercise.calories} kcal`
      : `${exercise.sets} hiệp × ${exercise.reps ?? 0} reps • Nghỉ ${exercise.restSec}s • ~${exercise.calories} kcal`;

  return (
    <Card variant="default">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={handlePress} accessibilityRole="checkbox" accessibilityState={{ checked: completed }} accessibilityLabel={`Đánh dấu hoàn thành ${exercise.name}`}>
          {completed ? (
            <Check color={resolveColor(theme, 'success')} size={24} />
          ) : (
            <Circle color={resolveColor(theme, 'outline')} size={24} />
          )}
        </Pressable>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: resolveColor(theme, 'primaryContainer'),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Dumbbell color={resolveColor(theme, 'onPrimaryContainer')} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>
            {index + 1}. {exercise.name}
          </Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }}>
            {detail}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default WorkoutItem;

