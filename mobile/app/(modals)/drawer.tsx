/**
 * Drawer (MOB-102) — side menu.
 * Sections (top-down): avatar + name + email, menu items, footer version.
 */
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Search, Users, MessageCircle, CalendarClock, Gem, HelpCircle, LogOut,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Avatar } from '@/components/ui';

export default function DrawerModal() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  if (!user) return null;

  const close = () => router.back();

  const menuItem = (icon: React.ReactNode, label: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        opacity: pressed ? theme.tokens.opacity.pressed : 1,
      })}
    >
      {icon}
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surfaceContainerLowest') }} edges={['top', 'bottom']}>
      <View style={{ padding: 20, gap: 4 }}>
        <Pressable onPress={() => { close(); router.push(`/(modals)/profile/${user.email}`); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={user.profile.name} size={56} tone="primary" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>{user.profile.name}</Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{user.email}</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: resolveColor(theme, 'outlineVariant') }} />

      {menuItem(<User color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Hồ sơ', () => { close(); router.push(`/(modals)/profile/${user.email}`); })}
      {menuItem(<Search color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Tìm kiếm', () => { close(); router.push('/(modals)/search'); })}
      {menuItem(<Users color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Bạn bè', () => { close(); router.push('/(modals)/friends'); })}
      {menuItem(<MessageCircle color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Tin nhắn', () => { close(); router.push('/(tabs)/social'); })}
      {menuItem(<CalendarClock color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Lịch hẹn', () => { close(); router.push('/(modals)/appointments'); })}
      {menuItem(<Gem color={resolveColor(theme, 'tertiary')} size={20} />, 'VIP', () => { close(); router.push('/(modals)/vip'); })}
      {menuItem(<HelpCircle color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Hỗ trợ', () => { close(); router.push('/(modals)/support'); })}
      {menuItem(<SettingsIcon color={resolveColor(theme, 'onSurfaceVariant')} size={20} />, 'Cài đặt', () => { close(); router.push('/(modals)/settings'); })}

      <View style={{ flex: 1 }} />

      <View style={{ height: 1, backgroundColor: resolveColor(theme, 'outlineVariant') }} />
      {menuItem(<LogOut color={resolveColor(theme, 'error')} size={20} />, 'Đăng xuất', async () => { await logout(); close(); router.replace('/(auth)/login'); })}
      <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, paddingHorizontal: 16, paddingVertical: 12 }}>
        Fitmate v0.1.0 — demo build
      </Text>
    </SafeAreaView>
  );
}
