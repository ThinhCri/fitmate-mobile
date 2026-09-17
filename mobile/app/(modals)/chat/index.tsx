/**
 * Messenger list screen — FP-029.
 * Hien thi tat ca ban be + search, tap vao friend -> ChatScreen.
 * Hien thi last message cua moi conversation.
 */
import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Search } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Avatar, Input, Empty } from '@/components/ui';

export default function MessengerListScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [query, setQuery] = useState('');

  if (!user) return null;

  const friendUsers = useMemo(() => user.friendsList, [user.friendsList]);

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friendUsers;
    return friendUsers.filter((email) => email.toLowerCase().includes(q));
  }, [friendUsers, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700', flex: 1 }}>Tin nhắn</Text>
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        <Input
          label=""
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm bạn bè..."
          rightIcon={<Search color={resolveColor(theme, 'onSurfaceVariant')} size={16} />}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        {filteredFriends.length === 0 ? (
          <Empty
            icon={<MessageCircle color={resolveColor(theme, 'onSurfaceVariant')} size={48} />}
            title={friendUsers.length === 0 ? 'Chưa có bạn bè nào' : 'Không tìm thấy'}
            description={friendUsers.length === 0 ? 'Kết bạn từ Tìm kiếm để bắt đầu nhắn tin.' : 'Thử từ khóa khác.'}
            actionLabel={friendUsers.length === 0 ? 'Tìm bạn' : undefined}
            onAction={friendUsers.length === 0 ? () => router.push('/(modals)/search') : undefined}
          />
        ) : (
          filteredFriends.map((email) => {
            const lastMsg = user.conversations[email]?.[user.conversations[email].length - 1];
            return (
              <Pressable key={email} onPress={() => router.push(`/(modals)/chat/${encodeURIComponent(email)}`)}>
                <Card variant="default">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={email.split('@')[0]} size={44} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                        {email.split('@')[0]}
                      </Text>
                      <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                        {lastMsg ? `${lastMsg.sender === 'user' ? 'Bạn: ' : ''}${lastMsg.text}` : 'Chưa có tin nhắn'}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
