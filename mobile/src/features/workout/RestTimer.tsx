/**
 * RestTimer — countdown timer for workout rest period.
 * FP-018.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button } from '@/components/ui';

export interface RestTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
}

export function RestTimer({ initialSeconds = 60, onComplete }: RestTimerProps) {
  const theme = useTheme();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            onComplete?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, seconds, onComplete]);

  const reset = () => {
    setRunning(false);
    setSeconds(initialSeconds);
  };

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <Card variant="default">
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>Nghỉ giữa hiệp</Text>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
          {mm}:{ss}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            label={running ? 'Tạm dừng' : 'Bắt đầu'}
            variant="primary"
            size="sm"
            onPress={() => setRunning((r) => !r)}
            iconLeft={running ? <Pause size={12} color="#fff" /> : <Play size={12} color="#fff" />}
          />
          <Button label="Reset" variant="ghost" size="sm" onPress={reset} iconLeft={<RotateCcw size={12} color="#1A1A1F" />} />
        </View>
      </View>
    </Card>
  );
}

export default RestTimer;
