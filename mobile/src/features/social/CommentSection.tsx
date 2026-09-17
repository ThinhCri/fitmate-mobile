import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { addComment } from '@/services/postsStore';
import { cleanContent } from '@/utils/toxic';
import { Card, Input, Button } from '@/components/ui';
import type { Comment } from '@/types';

export interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export function CommentSection({ postId, comments, onCommentAdded }: CommentSectionProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');

  if (!user) return null;

  const handleSubmit = async () => {
    const cleaned = cleanContent(draft);
    if (!cleaned.trim()) {
      Alert.alert('Bình luận trống', 'Vui lòng nhập nội dung bình luận.');
      return;
    }
    await addComment(postId, user.email, cleaned.trim());
    setDraft('');
    onCommentAdded();
  };

  return (
    <Card variant="flat">
      {comments.length === 0 ? (
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, textAlign: 'center' }}>
          Chưa có bình luận. Hãy là người đầu tiên!
        </Text>
      ) : (
        comments.map((c) => (
          <View key={c.id} style={{ paddingVertical: 6 }}>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '700' }}>
              {c.authorEmail.split('@')[0]}
            </Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{c.text}</Text>
          </View>
        ))
      )}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Input label="" value={draft} onChangeText={setDraft} placeholder="Viết bình luận..." />
        </View>
        <Button label="Gửi" variant="primary" size="sm" onPress={handleSubmit} />
      </View>
    </Card>
  );
}

export default CommentSection;
