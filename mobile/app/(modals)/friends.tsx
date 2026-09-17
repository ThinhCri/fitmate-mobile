/**
 * FriendRequestsScreen (MOB-104, FP-005).
 * Segmented: Da nhan | Ban be | Da gui.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { User } from '@/types';
import { Avatar, Button, Card, Chip } from '@/components/ui';

type Segment = 'received' | 'friends' | 'sent';

export default function FriendsScreen() {
  const { user: viewer, refresh } = useAuth();
  const theme = useTheme();
  const [segment, setSegment] = useState<Segment>('received');
  const [received, setReceived] = useState<User[]>([]);
  const [sent, setSent] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      if (!viewer) return;
      const all = await mockUserService.getAllUsers();
      setReceived(viewer.friendRequests.filter((r) => r.status === 'pending').map((r) => all[r.fromEmail]).filter(Boolean));
      setSent(viewer.sentRequests.map((e) => all[e]).filter(Boolean));
      setFriends(viewer.friendsList.map((e) => all[e]).filter(Boolean));
    })();
  }, [viewer]);

  const accept = async (otherEmail: string) => {
    if (!viewer) return;
    await mockUserService.updateOtherUser(otherEmail, (u) => ({
      ...u,
      friendRequests: u.friendRequests.map((r) => (r.fromEmail === otherEmail && r.toEmail === viewer.email ? { ...r, status: 'accepted' } : r)),
      friendsList: u.friendsList.includes(viewer.email) ? u.friendsList : [...u.friendsList, viewer.email],
    }));
    await mockUserService.saveUser({
      ...viewer,
      friendRequests: viewer.friendRequests.map((r) => (r.fromEmail === otherEmail ? { ...r, status: 'accepted' } : r)),
      friendsList: viewer.friendsList.includes(otherEmail) ? viewer.friendsList : [...viewer.friendsList, otherEmail],
      sentRequests: viewer.sentRequests.filter((e) => e !== otherEmail),
    });
    await refresh();
    setReceived((prev) => prev.filter((u) => u.email !== otherEmail));
  };

  const reject = async (otherEmail: string) => {
    if (!viewer) return;
    await mockUserService.saveUser({
      ...viewer,
      friendRequests: viewer.friendRequests.map((r) => (r.fromEmail === otherEmail ? { ...r, status: 'rejected' } : r)),
    });
    await refresh();
    setReceived((prev) => prev.filter((u) => u.email !== otherEmail));
  };

  if (!viewer) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Bạn bè</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 8 }}>
        <Chip label="Đã nhận" selected={segment === 'received'} onPress={() => setSegment('received')} />
        <Chip label="Bạn bè" selected={segment === 'friends'} onPress={() => setSegment('friends')} />
        <Chip label="Đã gửi" selected={segment === 'sent'} onPress={() => setSegment('sent')} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
        {segment === 'received' && (
          received.length === 0 ? <Empty text="Chưa có lời mời nào." /> :
          received.map((u) => (
            <Card key={u.email} variant="default">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={u.profile.name} size={48} tone="primary" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{u.profile.name}</Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{u.email}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button label="Chấp nhận" variant="primary" size="sm" onPress={() => accept(u.email)} />
                  <Button label="Từ chối" variant="secondary" size="sm" onPress={() => reject(u.email)} />
                </View>
              </View>
            </Card>
          ))
        )}
        {segment === 'friends' && (
          friends.length === 0 ? <Empty text="Chưa có bạn bè nào." /> :
          friends.map((u) => (
            <Pressable key={u.email} onPress={() => router.push(`/(modals)/profile/${u.email}`)}>
              <Card variant="default">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={u.profile.name} size={48} tone="primary" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{u.profile.name}</Text>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{u.email}</Text>
                  </View>
                  <Chip label="Bạn bè" selected />
                </View>
              </Card>
            </Pressable>
          ))
        )}
        {segment === 'sent' && (
          sent.length === 0 ? <Empty text="Chưa gửi lời mời nào." /> :
          sent.map((u) => (
            <Card key={u.email} variant="default">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={u.profile.name} size={48} tone="primary" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{u.profile.name}</Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{u.email}</Text>
                </View>
                <Chip label="Đã gửi" />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Card variant="default">
      <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', padding: 24 }}>{text}</Text>
    </Card>
  );
}
