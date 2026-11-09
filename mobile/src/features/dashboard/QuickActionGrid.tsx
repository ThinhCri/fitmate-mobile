/**
 * QuickActionGrid — 2x2 grid of shortcut cards.
 * Per screen-specs Section 5.1: Quet mon / Lich tap / Dat lich PT / Chuyen sau.
 */
import { View, Text, Pressable } from 'react-native';
import { Scan, CalendarDays, Briefcase, ClipboardList } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface QuickActionGridProps {
  onPressScan: () => void;
  onPressWorkout: () => void;
  onPressBooking: () => void;
  onPressChuyenSau: () => void;
}

export function QuickActionGrid({ onPressScan, onPressWorkout, onPressBooking, onPressChuyenSau }: QuickActionGridProps) {
  const theme = useTheme();
  const cell = {
    flex: 1,
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
    borderColor: resolveColor(theme, 'outlineVariant'),
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 12,
    gap: 8,
  };

  const labelStyle = { color: resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '600' as const };

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>Thao tác nhanh</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={onPressScan}
          style={({ pressed }) => [cell, { opacity: pressed ? theme.tokens.opacity.pressed : 1 }]}
        >
          <Scan color={resolveColor(theme, 'primary')} size={24} />
          <Text style={labelStyle}>Quét món · Sắp ra mắt</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onPressWorkout}
          style={({ pressed }) => [cell, { opacity: pressed ? theme.tokens.opacity.pressed : 1 }]}
        >
          <CalendarDays color={resolveColor(theme, 'primary')} size={24} />
          <Text style={labelStyle}>Lịch tập</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={onPressBooking}
          style={({ pressed }) => [cell, { opacity: pressed ? theme.tokens.opacity.pressed : 1 }]}
        >
          <Briefcase color={resolveColor(theme, 'primary')} size={24} />
          <Text style={labelStyle}>Đặt lịch PT</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onPressChuyenSau}
          style={({ pressed }) => [cell, { opacity: pressed ? theme.tokens.opacity.pressed : 1 }]}
        >
          <ClipboardList color={resolveColor(theme, 'primary')} size={24} />
          <Text style={labelStyle}>Chuyên sâu</Text>
        </Pressable>
      </View>
    </View>
  );
}
