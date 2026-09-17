/**
 * StreakCard — daily streak indicator.
 * 7-day target. Warning neu streak < 7, success neu >= 7.
 */
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card } from '@/components/ui/Card';

export interface StreakCardProps {
  streak: number;
  target?: number;
  onPress?: () => void;
}

export function StreakCard({ streak, target = 7, onPress }: StreakCardProps) {
  const theme = useTheme();
  const met = streak >= target;
  const tone = streak === 0 ? 'neutral' : met ? 'success' : 'warning';

  let borderColor: string;
  let textColor: string;
  if (streak === 0) {
    borderColor = resolveColor(theme, 'outlineVariant');
    textColor = resolveColor(theme, 'onSurfaceVariant');
  } else if (met) {
    borderColor = resolveColor(theme, 'success');
    textColor = resolveColor(theme, 'success');
  } else {
    borderColor = resolveColor(theme, 'warning');
    textColor = resolveColor(theme, 'warning');
  }

  return (
    <Card
      variant="default"
      style={{ borderColor, borderWidth: 1 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: resolveColor(theme, 'secondaryContainer'),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Flame color={resolveColor(theme, 'secondary')} size={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>
            {streak === 0 ? 'Bắt đầu streak!' : `${streak} ngày liên tục`}
          </Text>
          <Text style={{ color: textColor, fontSize: 12, marginTop: 2 }}>
            {streak === 0
              ? 'Tập hôm nay để khởi động chuỗi'
              : met
                ? `Hoàn thành mục tiêu ${target} ngày!`
                : `Còn ${target - streak} ngày nữa tới mục tiêu`}
          </Text>
        </View>
      </View>
    </Card>
  );
}
