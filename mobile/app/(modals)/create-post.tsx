/**
 * CreatePostModal (MOB-135, FP-008, FP-010, FP-012).
 * Text + image placeholder + link + tags + visibility + knowledge flag.
 *   - Empty post (no text/image/link) -> error.
 *   - Knowledge: min 15 chars content (FP-008).
 *   - Submit -> createPost store + reward sim warning toast (FP-010).
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Image, Link2 } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { addPost } from '@/services/postsStore';
import { validatePost } from '@/utils/toxic';
import { ToastService } from '@/components/ui/Toast';
import { Card, Button, Input, Chip } from '@/components/ui';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai' },
  { value: 'friends', label: 'Bạn bè' },
  { value: 'private', label: 'Riêng tư' },
] as const;

const SUGGESTED_TAGS = ['calisthenics', 'gym', 'dinh-duong', 'streak', 'beginner', 'health', 'recipe', 'workout'];
const MIN_KNOWLEDGE_CHARS = 15;

export default function CreatePostModal() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [imageAttached, setImageAttached] = useState(false);
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
    setError(null);
    if (!content.trim() && !imageAttached && !link.trim()) {
      setError('Vui lòng thêm nội dung, ảnh hoặc link.');
      return;
    }
    if (isKnowledge && content.trim().length < MIN_KNOWLEDGE_CHARS) {
      setError(`Bài viết kiến thức cần tối thiểu ${MIN_KNOWLEDGE_CHARS} ký tự.`);
      return;
    }
    const validation = validatePost(content);
    if (!validation.ok) {
      setError(validation.reason ?? 'Nội dung không hợp lệ.');
      return;
    }
    setSubmitting(true);
    try {
      const newPost = await addPost({
        authorEmail: user.email,
        content: content.trim(),
        image: imageAttached ? 'placeholder' : null,
        link: link.trim() || null,
        tags: selectedTags,
        visibility,
        isKnowledge,
      });
      // Also add to user's own posts list for cross-screen consistency.
      await mockUserService.saveUser({ ...user, posts: [...user.posts, newPost] });
      await refresh();
      if (isKnowledge) {
        ToastService.show({ message: 'Đây là simulation, không phải điểm thật!', tone: 'info', durationMs: 4000 });
      } else {
        ToastService.show({ message: 'Đã đăng bài!', tone: 'success' });
      }
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
          disabled={submitting || (!content.trim() && !imageAttached && !link.trim())}
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

        <View>
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
          {isKnowledge && (
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, marginTop: 4 }}>
              {content.trim().length}/{MIN_KNOWLEDGE_CHARS} ký tự (tối thiểu cho bài viết kiến thức)
            </Text>
          )}
        </View>
        {error && (
          <Text style={{ color: resolveColor(theme, 'error'), fontSize: 12 }}>{error}</Text>
        )}

        {/* Image placeholder (no real picker; demo = tap to toggle) */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setImageAttached((v) => !v)}
          style={{
            height: imageAttached ? 80 : 160,
            borderRadius: 12,
            backgroundColor: imageAttached ? resolveColor(theme, 'primaryContainer') : resolveColor(theme, 'surfaceContainerLow'),
            borderWidth: 1,
            borderColor: imageAttached ? resolveColor(theme, 'primary') : resolveColor(theme, 'outlineVariant'),
            borderStyle: imageAttached ? 'solid' : 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {imageAttached ? (
            <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 13, fontWeight: '600' }}>✓ Đã đính kèm ảnh (demo)</Text>
          ) : (
            <>
              <Image color={resolveColor(theme, 'onSurfaceVariant')} size={32} />
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>Thêm ảnh (nhấn để mô phỏng)</Text>
            </>
          )}
        </Pressable>

        {/* Link field */}
        <Input
          label="Link (tùy chọn)"
          value={link}
          onChangeText={setLink}
          placeholder="https://..."
          autoCapitalize="none"
          autoCorrect={false}
          rightIcon={<Link2 color={resolveColor(theme, 'onSurfaceVariant')} size={16} />}
        />

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
              Bài viết này là kiến thức thể hình — sẽ được nhân điểm mô phỏng.
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
