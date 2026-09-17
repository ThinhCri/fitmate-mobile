/**
 * SocialScreen (FP-008..013, FP-037, MOB-107..110).
 * Segmented: AI Companion | Cong dong.
 * Phase 2: 2 tab skeleton.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Users, Heart, Flame, Smile, Plus, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { ChatMessage } from '@/types';
import { Card, Chip, Avatar, Button, Input } from '@/components/ui';

type Segment = 'ai' | 'feed';

const AI_REPLIES = [
  'Tốt lắm! Bạn đang đi đúng hướng rồi.',
  'Hôm nay bạn đã tập chưa? Một buổi cardio nhẹ sẽ giúp giảm stress.',
  'Calorie hôm nay của bạn đang thiếu ~300 kcal. Ăn thêm một bữa phụ nhé!',
  'Streak 7 ngày rồi, cố lên! Duy trì là chìa khoá.',
  'Bạn có thể thử thêm bài tập plank để cải thiện core.',
];

export default function SocialScreen() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [segment, setSegment] = useState<Segment>('ai');
  const [aiDraft, setAiDraft] = useState('');
  const [replyIdx, setReplyIdx] = useState(0);

  if (!user) return null;

  const aiMessages: ChatMessage[] = user.aiChats[0]?.messages ?? [];

  const sendAi = async () => {
    if (!aiDraft.trim()) return;
    const userMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      text: aiDraft.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    const reply = AI_REPLIES[replyIdx % AI_REPLIES.length];
    const aiMsg: ChatMessage = {
      id: `ai-r-${Date.now()}`,
      text: reply,
      sender: 'ai',
      timestamp: new Date(Date.now() + 100).toISOString(),
    };
    const updatedChats = [...user.aiChats];
    if (!updatedChats[0]) {
      updatedChats.push({ id: 'chat-default', title: 'Buddy — AI Companion', messages: [] });
    }
    updatedChats[0] = {
      ...updatedChats[0],
      messages: [...updatedChats[0].messages, userMsg, aiMsg],
    };
    await mockUserService.saveUser({ ...user, aiChats: updatedChats });
    await refresh();
    setAiDraft('');
    setReplyIdx((i) => i + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '800' }}>Cộng đồng</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="AI Companion" selected={segment === 'ai'} onPress={() => setSegment('ai')} iconLeft={<Bot size={14} color={resolveColor(theme, 'onPrimaryContainer')} />} />
          <Chip label="Cộng đồng" selected={segment === 'feed'} onPress={() => setSegment('feed')} iconLeft={<Users size={14} color={resolveColor(theme, 'onPrimaryContainer')} />} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
        {segment === 'ai' && (
          <>
            <Card variant="flat">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Avatar name="Buddy" size={40} tone="primary" />
                <View>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Buddy</Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>AI Companion</Text>
                </View>
              </View>
            </Card>
            {aiMessages.length === 0 && (
              <Card variant="default">
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14 }}>
                  Hãy nói chuyện với Buddy để được hỗ trợ về tập luyện, dinh dưỡng, hoặc streak.
                </Text>
              </Card>
            )}
            {aiMessages.map((m) => (
              <View
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: m.sender === 'user' ? resolveColor(theme, 'primaryContainer') : resolveColor(theme, 'surfaceContainerLowest'),
                  borderWidth: m.sender === 'user' ? 0 : 1,
                  borderColor: resolveColor(theme, 'outlineVariant'),
                }}
              >
                <Text style={{ color: m.sender === 'user' ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurface'), fontSize: 14 }}>
                  {m.text}
                </Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Input label="" value={aiDraft} onChangeText={setAiDraft} placeholder="Hỏi Buddy..." />
              </View>
              <Button label="Gửi" variant="primary" onPress={sendAi} />
            </View>
          </>
        )}

        {segment === 'feed' && (
          <>
            <Button label="Tạo bài viết" variant="primary" fullWidth iconLeft={<Plus size={16} color={resolveColor(theme, 'onPrimary')} />} onPress={() => { /* TODO phase 3 */ }} />
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Mai Xuân Tú</Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, marginTop: 4 }}>
                Mẹo tập Calisthenics cho người mới: bắt đầu với 3 hiệp push-up mỗi ngày, tăng dần reps.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Pressable onPress={() => { /* TODO phase 3 */ }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Heart color={resolveColor(theme, 'error')} size={16} />
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>2</Text>
                </Pressable>
                <Pressable onPress={() => { /* TODO phase 3 */ }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Flame color={resolveColor(theme, 'secondary')} size={16} />
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>1</Text>
                </Pressable>
                <Pressable onPress={() => { /* TODO phase 3 */ }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MessageCircle color={resolveColor(theme, 'onSurfaceVariant')} size={16} />
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>0</Text>
                </Pressable>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
