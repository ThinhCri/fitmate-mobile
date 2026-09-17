/**
 * CreatePostModal (MOB-135, FP-012, FP-013).
 * Text + image placeholder + tags + visibility + knowledge flag.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Image } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { validatePost } from '@/utils/toxic';
import { Card, Button, Input, Chip } from '@/components/ui';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai' },
  { value: 'friends', label: 'Bạn bè' },
  { value: 'private', label: 'Riêng tư' },
] as const;

const SUGGESTED_TAGS = ['calisthenics', 'gym', 'dinh-duong', 'streak', 'beginner', 'health', 'recipe', 'workout'];

export default function CreatePostModal() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<typeof VISIBILITY_OPTIONS[number]['value']>('public');
  const [isKnowledge, setIsKnowledge] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const onPost = async () => {
    const validation = validatePost(content);
    if (!validation.ok) {
      setError(validation.reason ?? 'Nội dung không hợp lệ.');
      return;
    }
    setSubmitting(true);
    try {
      const newPost = {
        id: `post-${Date.now()}`,
        authorEmail: user.email,
        content: content.trim(),
        image: null,
        link: null,
        tags: selectedTags,
        visibility,
        isKnowledge,
        timestamp: new Date().toISOString(),
        reactions: [],
        comments: [],
      };
      await mockUserService.saveUser({ ...user, posts: [...user.posts, newPost] });
      await refresh();
      router.back();
    } catch (e) {
      setError('Đăng bài thất bại. Thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: resolveColor(theme, 'outlineVariant'),
        }}
      >
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <X color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', flex: 1 }}>Tạo bài viết</Text>
        <Button
          label={submitting ? '...' : 'Đăng'}
          variant="primary"
          size="sm"
          onPress={onPost}
          disabled={submitting || !content.trim()}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: resolveColor(theme, 'primaryContainer'),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 14, fontWeight: '700' }}>
              {user.profile.name[0]?.toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', marginTop: 10 }}>
            {user.profile.name}
          </Text>
        </View>

        <TextInput
          multiline
          value={content}
          onChangeText={(v) => { setContent(v); setError(null); }}
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor={resolveColor(theme, 'onSurfaceDisabled')}
          style={{
            color: resolveColor(theme, 'onSurface'),
            fontSize: 16,
            minHeight: 120,
            textAlignVertical: 'top',
          }}
        />
        {error && (
          <Text style={{ color: resolveColor(theme, 'error'), fontSize: 12 }}>{error}</Text>
        )}

        <Pressable
          accessibilityRole="button"
          style={{
            height: 160,
            borderRadius: 12,
            backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
            borderWidth: 1,
            borderColor: resolveColor(theme, 'outlineVariant'),
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Image color={resolveColor(theme, 'onSurfaceVariant')} size={32} />
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
            Thêm ảnh (demo: chưa có picker)
          </Text>
        </Pressable>

        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Gắn thẻ</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </Card>

        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Hiển thị</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {VISIBILITY_OPTIONS.map((v) => (
              <Chip key={v.value} label={v.label} selected={visibility === v.value} onPress={() => setVisibility(v.value)} />
            ))}
          </View>
        </Card>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isKnowledge }}
          onPress={() => setIsKnowledge((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: isKnowledge ? resolveColor(theme, 'primary') : resolveColor(theme, 'surfaceContainerLowest'),
              borderWidth: 2,
              borderColor: isKnowledge ? resolveColor(theme, 'primary') : resolveColor(theme, 'outline'),
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600' }}>Kiến thức (Knowledge)</Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
              Bài viết này là kiến thức thể hình — sẽ hiển thị trong tab Knowledge.
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
