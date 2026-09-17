/**
 * SettingsScreen (FP-003 hint).
 * Notification toggle, language, theme, units, link to support/terms.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, Globe, Ruler, Info, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';

export default function SettingsScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Button label="Quay lại" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Cài đặt</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Bell color={resolveColor(theme, 'primary')} size={18} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', flex: 1 }}>
              Thông báo
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => {
                setNotificationsEnabled(v);
                ToastService.show({ message: v ? 'Đã bật thông báo.' : 'Đã tắt thông báo.', tone: 'info' });
              }}
            />
          </View>
        </Card>

        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Globe color={resolveColor(theme, 'primary')} size={18} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', flex: 1 }}>
              Ngôn ngữ
            </Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{language === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
            <Button
              label="Đổi"
              variant="ghost"
              size="sm"
              onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            />
          </View>
        </Card>

        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ruler color={resolveColor(theme, 'primary')} size={18} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', flex: 1 }}>
              Đơn vị đo
            </Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{units === 'metric' ? 'kg / cm' : 'lb / in'}</Text>
            <Button
              label="Đổi"
              variant="ghost"
              size="sm"
              onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
            />
          </View>
        </Card>

        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
            Khác
          </Text>
          <View style={{ gap: 4 }}>
            <Button
              label="Hỗ trợ"
              variant="ghost"
              fullWidth
              iconLeft={<Info size={14} color="#1A1A1F" />}
              iconRight={<ChevronRight size={14} color="#1A1A1F" />}
              onPress={() => router.push('/(modals)/support')}
            />
            <Button
              label="Điều khoản sử dụng"
              variant="ghost"
              fullWidth
              iconRight={<ChevronRight size={14} color="#1A1A1F" />}
              onPress={() => ToastService.show({ message: 'Điều khoản (demo) — chưa triển khai.', tone: 'info' })}
            />
            <Button
              label="Đăng xuất"
              variant="ghost"
              fullWidth
              iconLeft={<LogOut size={14} color="#B91C1C" />}
              onPress={() => {
                signOut();
                router.replace('/(auth)/login');
              }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
