/**
 * DashboardHeader — avatar + name + streak chip + bell + reward + drawer + diamond + help.
 */
import { View, Text, Pressable } from 'react-native';
import { Menu, Bell, Award, Diamond, HelpCircle } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Avatar } from '@/components/ui';

export interface DashboardHeaderProps {
  name: string;
  streak: number;
  notificationCount: number;
  rewardPoints: number;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenReward: () => void;
  onOpenVip: () => void;
  onOpenSupport: () => void;
  onPressProfile: () => void;
}

export function DashboardHeader({
  name,
  streak,
  notificationCount,
  rewardPoints,
  onOpenDrawer,
  onOpenNotifications,
  onOpenReward,
  onOpenVip,
  onOpenSupport,
  onPressProfile,
}: DashboardHeaderProps) {
  const theme = useTheme();
  const iconBtn = {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={onOpenDrawer} style={iconBtn}>
        <Menu color={resolveColor(theme, 'onSurface')} size={22} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mở hồ sơ"
        onPress={onPressProfile}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}
      >
        <Avatar name={name} size={40} tone="primary" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                backgroundColor: resolveColor(theme, 'secondaryContainer'),
              }}
            >
              <Text style={{ color: resolveColor(theme, 'onSecondaryContainer'), fontSize: 11, fontWeight: '600' }}>
                🔥 {streak} ngày
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      {rewardPoints > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Phần thưởng" onPress={onOpenReward} style={iconBtn}>
          <Award color={resolveColor(theme, 'success')} size={22} />
        </Pressable>
      )}
      <Pressable accessibilityRole="button" accessibilityLabel="VIP" onPress={onOpenVip} style={iconBtn}>
        <Diamond color={resolveColor(theme, 'tertiary')} size={22} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Hỗ trợ" onPress={onOpenSupport} style={iconBtn}>
        <HelpCircle color={resolveColor(theme, 'onSurfaceVariant')} size={22} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Thông báo" onPress={onOpenNotifications} style={iconBtn}>
        <View>
          <Bell color={resolveColor(theme, 'onSurface')} size={22} />
          {notificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 4,
                borderRadius: 8,
                backgroundColor: resolveColor(theme, 'error'),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: resolveColor(theme, 'onError'), fontSize: 10, fontWeight: '700' }}>
                {notificationCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
