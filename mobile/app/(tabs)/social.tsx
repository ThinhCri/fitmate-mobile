/**
 * SocialScreen (FP-008..013, FP-037, MOB-107..110).
 * Segmented: AI Companion | Cong dong.
 * - AI tab (FP-011): chat list sidebar + 1200ms typing + canned reply + title edit + delete.
 * - Feed tab (FP-009/010/013/037): 5 seed posts + new posts, reaction toggle (heart/flame/smile),
 *   comment expand, reward simulation warning toast (FP-010).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Bot, Users, Plus, Send,
  ChevronLeft, Plus as PlusIcon, Trash2, Check,
} from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { getAllPostsSync, subscribe as subscribePosts } from '@/services/postsStore';
import { PostCard, CommentSection } from '@/features/social';
import type { ChatMessage, Post } from '@/types';
import { Card, Chip, Avatar, Button, Input, Empty } from '@/components/ui';

type Segment = 'ai' | 'feed';

const AI_REPLIES = [
  'Tốt lắm! Bạn đang đi đúng hướng rồi.',
  'Hôm nay bạn đã tập chưa? Một buổi cardio nhẹ sẽ giúp giảm stress.',
  'Calorie hôm nay của bạn đang thiếu ~300 kcal. Ăn thêm một bữa phụ nhé!',
  'Streak 7 ngày rồi, cố lên! Duy trì là chìa khoá.',
  'Bạn có thể thử thêm bài tập plank để cải thiện core.',
  'Đừng quên uống đủ 2L nước mỗi ngày nhé.',
  'Ngủ đủ 7-8 tiếng giúp phục hồi cơ bắp tốt hơn.',
];

const TYPING_DELAY_MS = 1200;

export default function SocialScreen() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [segment, setSegment] = useState<Segment>('ai');

  // Feed state
  const [posts, setPosts] = useState<Post[]>(() => getAllPostsSync());
  const [refreshing, setRefreshing] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);

  // AI state
  const [aiDraft, setAiDraft] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const replyIdxRef = useRef(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const refreshPosts = useCallback(() => {
    setPosts([...getAllPostsSync()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const onRefreshSocial = useCallback(() => {
    refreshPosts();
    setRefreshing(false);
  }, [refreshPosts]);

  useEffect(() => {
    const unsub = subscribePosts(() => refreshPosts());
    return unsub;
  }, [refreshPosts]);

  const visiblePosts = useMemo(() => {
    if (!user) return [];
    return posts.filter((p) => {
      if (p.visibility === 'public') return true;
      if (p.visibility === 'friends') return user.friendsList.includes(p.authorEmail);
      if (p.visibility === 'private') return p.authorEmail === user.email;
      return true;
    });
  }, [posts, user]);

  if (!user) return null;

  const aiChats = user.aiChats;
  const currentChat = aiChats.find((c) => c.id === selectedChatId) ?? aiChats[0];

  // ---------------- AI handlers ----------------
  const createChat = async () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'Hội thoại mới',
      messages: [],
    };
    const updatedChats = [...aiChats, newChat];
    await mockUserService.saveUser({ ...user, aiChats: updatedChats });
    await refresh();
    setSelectedChatId(newChat.id);
    setShowChatList(false);
  };

  const deleteChat = async (id: string) => {
    Alert.alert('Xóa hội thoại', 'Bạn có chắc muốn xóa hội thoại này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const updated = aiChats.filter((c) => c.id !== id);
          await mockUserService.saveUser({ ...user, aiChats: updated });
          await refresh();
          if (selectedChatId === id) setSelectedChatId(null);
        },
      },
    ]);
  };

  const saveTitle = async () => {
    if (!currentChat) return;
    const updated = aiChats.map((c) => (c.id === currentChat.id ? { ...c, title: titleDraft.trim() || c.title } : c));
    await mockUserService.saveUser({ ...user, aiChats: updated });
    await refresh();
    setEditingTitle(false);
  };

  const sendAi = async () => {
    if (!aiDraft.trim() || !currentChat) return;
    const userMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      text: aiDraft.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    const replyText = AI_REPLIES[replyIdxRef.current % AI_REPLIES.length];
    replyIdxRef.current += 1;
    // Append user msg immediately
    const updatedChats1 = aiChats.map((c) =>
      c.id === currentChat.id ? { ...c, messages: [...c.messages, userMsg] } : c
    );
    await mockUserService.saveUser({ ...user, aiChats: updatedChats1 });
    await refresh();

    // Auto-set title from first 18 chars if title is default
    if (currentChat.title === 'Hội thoại mới' || currentChat.title === 'Buddy — AI Companion') {
      const autoTitle = userMsg.text.slice(0, 18);
      const updatedChatsTitle = aiChats.map((c) =>
        c.id === currentChat.id ? { ...c, title: autoTitle, messages: [...c.messages, userMsg] } : c
      );
      await mockUserService.saveUser({ ...user, aiChats: updatedChatsTitle });
      await refresh();
    }

    setAiDraft('');
    setAiTyping(true);

    setTimeout(async () => {
      const aiMsg: ChatMessage = {
        id: `ai-r-${Date.now()}`,
        text: replyText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      const updatedChats2 = aiChats.map((c) =>
        c.id === currentChat.id ? { ...c, messages: [...c.messages, userMsg, aiMsg] } : c
      );
      await mockUserService.saveUser({ ...user, aiChats: updatedChats2 });
      await refresh();
      setAiTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, TYPING_DELAY_MS);
  };

  // ---------------- Feed handlers (now delegated to CommentSection) ----------------

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '800' }}>Cộng đồng</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="AI Companion" selected={segment === 'ai'} onPress={() => setSegment('ai')} iconLeft={<Bot size={14} color={resolveColor(theme, segment === 'ai' ? 'onPrimaryContainer' : 'onSurface')} />} />
          <Chip label="Cộng đồng" selected={segment === 'feed'} onPress={() => setSegment('feed')} iconLeft={<Users size={14} color={resolveColor(theme, segment === 'feed' ? 'onPrimaryContainer' : 'onSurface')} />} />
        </View>
      </View>

      {segment === 'ai' && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Chat list */}
          {showChatList ? (
            <View style={{ flex: 1, padding: 16, gap: 8 }}>
              <Button label="Hội thoại mới" variant="primary" fullWidth iconLeft={<PlusIcon size={14} color={resolveColor(theme, 'onPrimary')} />} onPress={createChat} />
              {aiChats.length === 0 ? (
                <Card variant="default">
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, textAlign: 'center' }}>
                    Chưa có hội thoại nào.
                  </Text>
                </Card>
              ) : (
                aiChats.map((chat) => (
                  <Pressable key={chat.id} onPress={() => { setSelectedChatId(chat.id); setShowChatList(false); }}>
                    <Card variant={selectedChatId === chat.id ? 'highlighted' : 'flat'}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Bot color={resolveColor(theme, 'primary')} size={18} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                            {chat.title}
                          </Text>
                          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }} numberOfLines={1}>
                            {chat.messages[chat.messages.length - 1]?.text ?? 'Chưa có tin nhắn'}
                          </Text>
                        </View>
                        <Pressable onPress={() => deleteChat(chat.id)} hitSlop={8}>
                          <Trash2 color={resolveColor(theme, 'error')} size={14} />
                        </Pressable>
                      </View>
                    </Card>
                  </Pressable>
                ))
              )}
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* Chat header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: resolveColor(theme, 'outlineVariant') }}>
                <Pressable onPress={() => setShowChatList(true)} hitSlop={8}>
                  <ChevronLeft color={resolveColor(theme, 'onSurface')} size={20} />
                </Pressable>
                <Avatar name="Buddy" size={28} tone="primary" />
                {editingTitle ? (
                  <View style={{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <TextInput
                      style={{ flex: 1, color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: resolveColor(theme, 'primary'), paddingVertical: 2 }}
                      value={titleDraft}
                      onChangeText={setTitleDraft}
                      autoFocus
                    />
                    <Pressable onPress={saveTitle} hitSlop={8}>
                      <Check color={resolveColor(theme, 'primary')} size={18} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={{ flex: 1 }} onPress={() => { setTitleDraft(currentChat?.title ?? ''); setEditingTitle(true); }}>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                      {currentChat?.title ?? 'Buddy — AI Companion'}
                    </Text>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>AI Companion • Nhấn để sửa</Text>
                  </Pressable>
                )}
              </View>
              <ScrollView
                ref={scrollRef as any}
                contentContainerStyle={{ padding: 12, gap: 8 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
              >
                {(currentChat?.messages ?? []).map((m) => (
                  <View
                    key={m.id}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: 10,
                      borderRadius: 14,
                      backgroundColor: m.sender === 'user' ? resolveColor(theme, 'primaryContainer') : resolveColor(theme, 'surfaceContainerLowest'),
                    }}
                  >
                    <Text style={{ color: m.sender === 'user' ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurface'), fontSize: 13 }}>
                      {m.text}
                    </Text>
                  </View>
                ))}
                {aiTyping && (
                  <View style={{ alignSelf: 'flex-start', padding: 10, borderRadius: 14, backgroundColor: resolveColor(theme, 'surfaceContainerLowest') }}>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, fontStyle: 'italic' }}>
                      Buddy đang gõ...
                    </Text>
                  </View>
                )}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 6, padding: 12, borderTopWidth: 1, borderTopColor: resolveColor(theme, 'outlineVariant') }}>
                <View style={{ flex: 1 }}>
                  <Input label="" value={aiDraft} onChangeText={setAiDraft} placeholder="Hỏi Buddy..." />
                </View>
                <Button label="Gửi" variant="primary" onPress={sendAi} iconLeft={<Send size={14} color={resolveColor(theme, 'onPrimary')} />} />
              </View>
            </View>
          )}
        </View>
      )}

      {segment === 'feed' && (
        <>
          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
            refreshControl={(
              <RefreshControl refreshing={refreshing} onRefresh={onRefreshSocial} />
            )}
          >
            <Button
              label="Tạo bài viết"
              variant="primary"
              fullWidth
              iconLeft={<Plus size={16} color={resolveColor(theme, 'onPrimary')} />}
              onPress={() => router.push('/(modals)/create-post')}
            />
            <Card variant="flat">
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, textAlign: 'center' }}>
                ⚠️ Điểm thưởng từ bài viết kiến thức là mô phỏng, không phải điểm thật.
              </Text>
            </Card>
            {visiblePosts.length === 0 ? (
              <Empty icon={<Users color={resolveColor(theme, 'onSurfaceVariant')} size={48} />} title="Chưa có bài viết" description="Hãy là người đầu tiên chia sẻ." />
            ) : (
              visiblePosts.map((post) => (
                <View key={post.id} style={{ gap: 8 }}>
                  <PostCard
                    post={post}
                    onReactionChange={refreshPosts}
                    onCommentPress={(id) => setCommentingPostId(commentingPostId === id ? null : id)}
                  />
                  {commentingPostId === post.id && (
                    <CommentSection
                      postId={post.id}
                      comments={post.comments}
                      onCommentAdded={refreshPosts}
                    />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
