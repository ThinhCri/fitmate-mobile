import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Heart, Flame, Smile, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { toggleReaction } from '@/services/postsStore';
import type { Post, Reaction } from '@/types';
import { Card, Avatar } from '@/components/ui';

export type ReactionType = 'heart' | 'flame' | 'smile';

export interface PostCardProps {
  post: Post;
  onReactionChange: () => void;
  onCommentPress: (postId: string) => void;
}

const reactionMeta: Record<ReactionType, { Icon: typeof Heart; colorKey: 'error' | 'secondary' | 'warning'; label: string }> = {
  heart: { Icon: Heart, colorKey: 'error', label: 'Yêu thích' },
  flame: { Icon: Flame, colorKey: 'secondary', label: 'Truyền lửa' },
  smile: { Icon: Smile, colorKey: 'warning', label: 'Thích' },
};

export function PostCard({ post, onReactionChange, onCommentPress }: PostCardProps) {
  const theme = useTheme();
  const { user } = useAuth();
  if (!user) return null;

  const counts: Record<ReactionType, number> = { heart: 0, flame: 0, smile: 0 };
  post.reactions.forEach((r) => {
    counts[r.type] = (counts[r.type] || 0) + 1;
  });

  const myReaction = (type: ReactionType) =>
    !!post.reactions.find((r) => r.userEmail === user.email && r.type === type);

  const handleReaction = async (type: ReactionType) => {
    await toggleReaction(post.id, user.email, type);
    onReactionChange();
  };

  const authorLabel = post.authorEmail.split('@')[0];
  const timestampLabel = new Date(post.timestamp).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card variant="default">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Avatar name={authorLabel} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '700' }}>
            {authorLabel}
          </Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>
            {timestampLabel}
            {post.isKnowledge ? '  •  Kiến thức' : ''}
          </Text>
        </View>
      </View>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, marginTop: 8, lineHeight: 20 }}>
        {post.content}
      </Text>
      {post.image && (
        <View
          style={{
            height: 160,
            borderRadius: 8,
            backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
            marginTop: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>(ảnh minh hoạ)</Text>
        </View>
      )}
      {post.link && (
        <Text style={{ color: resolveColor(theme, 'info'), fontSize: 12, marginTop: 8 }}>{post.link}</Text>
      )}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
        {(Object.keys(reactionMeta) as ReactionType[]).map((type) => {
          const { Icon, colorKey } = reactionMeta[type];
          const isActive = myReaction(type);
          return (
            <Pressable
              key={type}
              accessibilityRole="button"
              accessibilityLabel={`${reactionMeta[type].label} (${counts[type]})`}
              onPress={() => handleReaction(type)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Icon
                color={isActive ? resolveColor(theme, colorKey) : resolveColor(theme, 'outline')}
                size={16}
                fill={isActive ? resolveColor(theme, colorKey) : 'transparent'}
              />
              <Text
                style={{
                  color: isActive ? resolveColor(theme, colorKey) : resolveColor(theme, 'onSurfaceVariant'),
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                {counts[type]}
              </Text>
            </Pressable>
          );
        })}
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Bình luận (${post.comments.length})`}
          onPress={() => onCommentPress(post.id)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <MessageCircle color={resolveColor(theme, 'outline')} size={16} />
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, fontWeight: '600' }}>
            {post.comments.length}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default PostCard;
