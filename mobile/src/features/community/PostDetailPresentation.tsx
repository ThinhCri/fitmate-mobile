import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  MoreVertical,
  Heart,
  Flame,
  Smile,
  Send,
  ShieldAlert,
  Trash2,
  Lock,
  Globe,
  Users,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { Avatar } from '@/components/design-system/Avatar';
import { ModalShell } from '@/components/design-system/ModalShell';
import { CommunityPostViewModel, PostCommentViewModel } from './communityTypes';

export interface PostDetailPresentationProps {
  post: CommunityPostViewModel;
  currentUserId?: string;
  onBack: () => void;
  onReaction: (type: 'love' | 'fire' | 'smile') => void;
  onAddComment: (text: string) => Promise<boolean> | void;
  onDeleteComment?: (commentId: string) => void;
  onDeletePost?: () => void;
  onReportPress: (targetType: 'post' | 'comment', targetId: string, authorName: string) => void;
  onAuthorPress: (authorId: string) => void;
}

export function PostDetailPresentation({
  post,
  currentUserId,
  onBack,
  onReaction,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onReportPress,
  onAuthorPress,
}: PostDetailPresentationProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);

  const comments = post.comments || [];
  const isOwner = post.isOwner || (currentUserId && post.authorId === currentUserId);

  const handleSendComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;
    const textToSend = replyToUser ? `@${replyToUser} ${commentText.trim()}` : commentText.trim();

    setIsSubmittingComment(true);
    setSendError(null);
    try {
      await onAddComment(textToSend);
      setCommentText('');
      setReplyToUser(null);
    } catch (err: any) {
      setSendError('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'friends':
        return <Users size={12} color={colors.textSecondary} />;
      case 'private':
        return <Lock size={12} color={colors.textSecondary} />;
      default:
        return <Globe size={12} color={colors.textSecondary} />;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <TouchableOpacity
          onPress={() => setShowOptionsMenu(true)}
          style={styles.iconBtn}
          accessibilityLabel="Tùy chọn bài viết"
          accessibilityRole="button"
        >
          <MoreVertical size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        {/* Post Card */}
        <Card style={styles.postCard}>
          {/* Author Header */}
          <View style={styles.authorRow}>
            <TouchableOpacity
              onPress={() => onAuthorPress(post.authorId)}
              style={styles.authorInfoTouch}
            >
              <Avatar name={post.authorName} size="md" />
              <View style={styles.authorDetails}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  {post.authorRole === 'pt' && (
                    <View style={styles.ptBadge}>
                      <Text style={styles.ptBadgeText}>HLV</Text>
                    </View>
                  )}
                  {post.authorVerified && (
                    <CheckCircle2 size={14} color={colors.primary} />
                  )}
                </View>
                <View style={styles.timeVisibilityRow}>
                  <Text style={styles.timeText}>{post.createdAt}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  {getVisibilityIcon()}
                  <Text style={styles.visibilityLabel}>
                    {post.visibility === 'public'
                      ? 'Công khai'
                      : post.visibility === 'friends'
                      ? 'Bạn bè'
                      : 'Riêng tư'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Tags */}
          {((post.workoutTags && post.workoutTags.length > 0) ||
            (post.mealTags && post.mealTags.length > 0) ||
            post.isKnowledgeSharing) && (
            <View style={styles.tagsRow}>
              {post.isKnowledgeSharing && (
                <View style={styles.knowledgeTag}>
                  <Text style={styles.knowledgeTagText}>Cẩm nang kiến thức</Text>
                </View>
              )}
              {post.workoutTags?.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {post.mealTags?.map((tag) => (
                <View key={tag} style={styles.mealTagPill}>
                  <Text style={styles.mealTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Media images */}
          {(post.mediaUrls?.length || post.mediaUrl) ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaRow}>
              {(post.mediaUrls?.length ? post.mediaUrls : [post.mediaUrl!]).map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.mediaContainer}>
                  <Image source={{ uri }} style={styles.mediaImage} accessibilityRole="image" accessibilityLabel={`Ảnh bài viết ${index + 1}`} />
                </View>
              ))}
            </ScrollView>
          ) : null}

          {/* Reaction Bar */}
          <View style={styles.reactionBar}>
            <View style={styles.reactionsLeft}>
              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  post.reactions.userReaction === 'love' && styles.reactionButtonActiveLove,
                ]}
                onPress={() => onReaction('love')}
                accessibilityLabel="Thích bài viết"
              >
                <Heart
                  size={18}
                  color={
                    post.reactions.userReaction === 'love' ? colors.danger : colors.textSecondary
                  }
                  fill={post.reactions.userReaction === 'love' ? colors.danger : 'none'}
                />
                <Text style={styles.reactionCount}>{post.reactions.love}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  post.reactions.userReaction === 'fire' && styles.reactionButtonActiveFire,
                ]}
                onPress={() => onReaction('fire')}
                accessibilityLabel="Tuyệt vời"
              >
                <Flame
                  size={18}
                  color={
                    post.reactions.userReaction === 'fire' ? colors.warning : colors.textSecondary
                  }
                  fill={post.reactions.userReaction === 'fire' ? colors.warning : 'none'}
                />
                <Text style={styles.reactionCount}>{post.reactions.fire}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  post.reactions.userReaction === 'smile' && styles.reactionButtonActiveSmile,
                ]}
                onPress={() => onReaction('smile')}
                accessibilityLabel="Đồng tình"
              >
                <Smile
                  size={18}
                  color={
                    post.reactions.userReaction === 'smile' ? colors.primary : colors.textSecondary
                  }
                />
                <Text style={styles.reactionCount}>{post.reactions.smile}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentCountWrapper}>
              <MessageSquare size={16} color={colors.textSecondary} />
              <Text style={styles.commentCountText}>{comments.length} bình luận</Text>
            </View>
          </View>
        </Card>

        {/* Error Banner */}
        {sendError && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={16} color={colors.danger} />
            <Text style={styles.errorText}>{sendError}</Text>
            <TouchableOpacity onPress={handleSendComment}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>
            Bình luận ({comments.length})
          </Text>

          {comments.length === 0 ? (
            <View style={styles.emptyCommentsBox}>
              <Text style={styles.emptyCommentsText}>
                Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentRow}>
                <TouchableOpacity onPress={() => onAuthorPress(comment.authorId)}>
                  <Avatar name={comment.authorName} size="sm" />
                </TouchableOpacity>

                <View style={styles.commentBubble}>
                  <View style={styles.commentBubbleHeader}>
                    <TouchableOpacity onPress={() => onAuthorPress(comment.authorId)}>
                      <Text style={styles.commentAuthorName}>{comment.authorName}</Text>
                    </TouchableOpacity>
                    {comment.authorRole === 'pt' && (
                      <View style={styles.commentPtBadge}>
                        <Text style={styles.commentPtBadgeText}>HLV</Text>
                      </View>
                    )}
                    <Text style={styles.commentTime}>{comment.createdAt}</Text>
                  </View>

                  <Text style={styles.commentContent}>{comment.text}</Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => setReplyToUser(comment.authorName)}
                      style={styles.commentActionBtn}
                    >
                      <Text style={styles.commentActionText}>Trả lời</Text>
                    </TouchableOpacity>

                    {comment.isOwner && onDeleteComment && (
                      <TouchableOpacity
                        onPress={() => onDeleteComment(comment.id)}
                        style={styles.commentActionBtn}
                      >
                        <Text style={[styles.commentActionText, { color: colors.danger }]}>
                          Xóa
                        </Text>
                      </TouchableOpacity>
                    )}

                    {!comment.isOwner && (
                      <TouchableOpacity
                        onPress={() =>
                          onReportPress('comment', comment.id, comment.authorName)
                        }
                        style={styles.commentActionBtn}
                      >
                        <Text style={styles.commentActionText}>Báo cáo</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Composer */}
      <View style={styles.bottomComposerContainer}>
        {replyToUser && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>
              Đang trả lời <Text style={styles.replyBannerUser}>{replyToUser}</Text>
            </Text>
            <TouchableOpacity onPress={() => setReplyToUser(null)}>
              <Text style={styles.cancelReplyText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.composerInputRow}>
          <TextInput
            style={styles.composerTextInput}
            placeholder="Viết bình luận công khai..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!commentText.trim() || isSubmittingComment) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || isSubmittingComment}
            accessibilityLabel="Gửi bình luận"
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overflow Options Modal */}
      <ModalShell
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        title="Tùy chọn bài viết"
      >
        <View style={styles.modalOptionsContainer}>
          {isOwner && onDeletePost && (
            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setShowOptionsMenu(false);
                Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa bài viết này không?', [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Xóa bài', style: 'destructive', onPress: onDeletePost },
                ]);
              }}
            >
              <Trash2 size={20} color={colors.danger} />
              <Text style={[styles.modalOptionText, { color: colors.danger }]}>Xóa bài viết</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.modalOptionItem}
            onPress={() => {
              setShowOptionsMenu(false);
              onReportPress('post', post.id, post.authorName);
            }}
          >
            <ShieldAlert size={20} color={colors.warning} />
            <Text style={styles.modalOptionText}>Báo cáo vi phạm</Text>
          </TouchableOpacity>
        </View>
      </ModalShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  postCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfoTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorDetails: {
    gap: 2,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authorName: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  ptBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  ptBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  timeVisibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dotSeparator: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  visibilityLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  postContent: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  knowledgeTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  knowledgeTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  tagPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mealTagPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  mealTagText: {
    ...typography.caption,
    color: '#B45309',
  },
  mediaContainer: {
    width: 280,
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.xs,
    marginRight: spacing.sm,
  },
  mediaRow: { marginTop: spacing.xs },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  reactionsLeft: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  reactionButtonActiveLove: {
    backgroundColor: '#FEE2E2',
  },
  reactionButtonActiveFire: {
    backgroundColor: '#FEF3C7',
  },
  reactionButtonActiveSmile: {
    backgroundColor: colors.primaryLight,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  commentCountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCountText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  retryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  commentsSection: {
    gap: spacing.sm,
  },
  commentsSectionTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  emptyCommentsBox: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCommentsText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  commentBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  commentPtBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 4,
    borderRadius: radius.xs,
  },
  commentPtBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  commentTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  commentContent: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  commentActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 4,
  },
  commentActionBtn: {
    paddingVertical: 2,
  },
  commentActionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bottomComposerContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  replyBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  replyBannerUser: {
    fontWeight: '700',
    color: colors.primary,
  },
  cancelReplyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  composerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  composerTextInput: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    maxHeight: 100,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  modalOptionsContainer: {
    gap: spacing.sm,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
