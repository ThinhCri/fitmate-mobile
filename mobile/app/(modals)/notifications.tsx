/**
 * NotificationsScreen (MOB-103) — list + segment: Tat ca | Loi moi | He thong.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { Notification } from '@/types';
import { Card, Chip } from '@/components/ui';
import { formatRelative } from '@/utils/format';

type Segment = 'all' | 'friend' | 'system';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [items, setItems] = useState<Notification[]>([]);
  const [segment, setSegment] = useState<Segment>('all');

  useEffect(() => {
    if (!user) return;
    setItems(user.notifications);
  }, [user]);

  if (!user) return null;

  const filtered = items.filter((n) => {
    if (segment === 'all') return true;
    if (segment === 'friend') return n.type === 'friend_request';
    return n.type === 'system';
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Thông báo</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 8 }}>
        <Chip label="Tất cả" selected={segment === 'all'} onPress={() => setSegment('all')} />
        <Chip label="Lời mời" selected={segment === 'friend'} onPress={() => setSegment('friend')} />
        <Chip label="Hệ thống" selected={segment === 'system'} onPress={() => setSegment('system')} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
        {filtered.length === 0 ? (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', padding: 24 }}>
              Không có thông báo nào.
            </Text>
          </Card>
        ) : (
          filtered.map((n) => (
            <Card key={n.id} variant="default">
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                {!n.read && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: resolveColor(theme, 'primary'),
                      marginTop: 6,
                    }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14 }}>{n.message}</Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, marginTop: 4 }}>
                    {formatRelative(n.timestamp)}
                  </Text>
                  {n.type === 'friend_request' && n.fromEmail && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push(`/(modals)/profile/${n.fromEmail}`)}
                      style={{ marginTop: 8 }}
                    >
                      <Text style={{ color: resolveColor(theme, 'primary'), fontSize: 12, fontWeight: '600' }}>Xem hồ sơ →</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
