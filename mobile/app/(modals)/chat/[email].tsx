/**
 * ChatScreen — 1-1 chat giữa viewer va otherEmail.
 * Local state; cross-user sync qua mockUserService.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Info } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { ChatMessage, User } from '@/types';
import { Avatar } from '@/components/ui';
import { formatTime } from '@/utils/format';

export default function ChatScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { user: viewer, refresh } = useAuth();
  const theme = useTheme();
  const [other, setOther] = useState<User | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    (async () => {
      if (!email) return;
      const u = await mockUserService.getUserByEmail(email);
      setOther(u);
    })();
  }, [email]);

  if (!viewer || !other) return null;

  const messages = viewer.conversations[other.email] ?? [];

  const send = async () => {
    if (!draft.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: draft.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    // Update viewer's conversations
    const updatedViewer = {
      ...viewer,
      conversations: {
        ...viewer.conversations,
        [other.email]: [...(viewer.conversations[other.email] ?? []), newMsg],
      },
    };
    await mockUserService.saveUser(updatedViewer);
    // Cross-user sync to other
    await mockUserService.updateOtherUser(other.email, (u) => ({
      ...u,
      conversations: {
        ...u.conversations,
        [viewer.email]: [...(u.conversations[viewer.email] ?? []), { ...newMsg, sender: 'friend' }],
      },
    }));
    await refresh();
    setDraft('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          gap: 12,
          backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
          borderBottomWidth: 1,
          borderBottomColor: resolveColor(theme, 'outlineVariant'),
        }}
      >
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Avatar name={other.profile.name} size={36} tone={other.profile.isPt && other.profile.isVerified ? 'tertiary' : 'primary'} />
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', flex: 1 }} numberOfLines={1}>
          {other.profile.name}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/(modals)/profile/${other.email}`)} hitSlop={12}>
          <Info color={resolveColor(theme, 'onSurfaceVariant')} size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}>
        {messages.length === 0 && (
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', padding: 24 }}>
            Hãy bắt đầu cuộc trò chuyện.
          </Text>
        )}
        {messages.map((m) => {
          const isMe = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                padding: 12,
                borderRadius: 16,
                backgroundColor: isMe ? resolveColor(theme, 'primaryContainer') : resolveColor(theme, 'surfaceContainerLowest'),
                borderWidth: isMe ? 0 : 1,
                borderColor: resolveColor(theme, 'outlineVariant'),
              }}
            >
              <Text style={{ color: isMe ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurface'), fontSize: 14 }}>
                {m.text}
              </Text>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 10, marginTop: 4 }}>
                {formatTime(m.timestamp)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
          borderTopWidth: 1,
          borderTopColor: resolveColor(theme, 'outlineVariant'),
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={resolveColor(theme, 'onSurfaceDisabled')}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 22,
            backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
            paddingHorizontal: 16,
            fontSize: 14,
            color: resolveColor(theme, 'onSurface'),
          }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={send}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: resolveColor(theme, 'primary'),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send color={resolveColor(theme, 'onPrimary')} size={20} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
