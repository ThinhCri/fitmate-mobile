import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  Users,
  MessageCircle,
  Heart,
  ShieldAlert,
  Send,
  Bookmark,
  MoreVertical,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { EmptyState } from '@/components/design-system/FeedbackStates';
import { CommunityPostViewModel } from './communityTypes';
import { useTabBarScroll } from '@/context/TabBarVisibilityContext';
import { GradientBackground } from '@/components/design-system/GradientBackground';

export interface CommunityFeedPresentationProps {
  posts: CommunityPostViewModel[];
  activeSegment: 'community' | 'ai';
  selectedCategory: 'all' | 'friends' | 'workout_exp' | 'nutrition_qa';
  onSegmentChange: (segment: 'community' | 'ai') => void;
  onCategoryChange: (category: 'all' | 'friends' | 'workout_exp' | 'nutrition_qa') => void;
  onReaction: (postId: string, type: 'love') => void;
  onSelectPost: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onCreatePostPress: () => void;
  onReportPress: (postId: string) => void;
  onAuthorPress: (authorId: string) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  showFeedChrome?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CommunityFeedPresentation({
  posts,
  activeSegment,
  selectedCategory,
  onSegmentChange,
  onCategoryChange,
  onReaction,
  onSelectPost,
  onSharePost,
  onBookmarkPost,
  onCreatePostPress,
  onReportPress,
  onAuthorPress,
  onScroll: externalOnScroll,
  showFeedChrome = true,
  emptyTitle = 'Chưa có bài viết',
  emptyDescription = 'Bảng tin này chưa có nội dung phù hợp. Hãy chia sẻ bài viết đầu tiên.',
}: CommunityFeedPresentationProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [activeMedia, setActiveMedia] = useState<Record<string, number>>({});
  const mediaWidth = Math.max(240, screenWidth - spacing.md * 4);
  const { onScroll: handleScroll, scrollEventThrottle } = useTabBarScroll(externalOnScroll);
  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'workout_exp', label: 'Kinh nghiệm tập' },
    { key: 'nutrition_qa', label: 'Hỏi đáp dinh dưỡng' },
  ] as const;

  return (
    <GradientBackground>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
    >
      {showFeedChrome && <>
      {/* Top Segmented Controls: Feed vs AI Assistant */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmentedTrack}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'community' && styles.segmentBtnActive]}
            onPress={() => onSegmentChange('community')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSegment === 'community' }}
            accessibilityLabel="Bảng tin cộng đồng"
          >
            <Users size={16} color={activeSegment === 'community' ? '#FFFFFF' : colors.textSecondary} />
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'community' && styles.segmentTextActive,
              ]}
            >
              Cộng đồng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'ai' && styles.segmentBtnActive]}
            onPress={() => onSegmentChange('ai')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSegment === 'ai' }}
            accessibilityLabel="Trợ lý AI Fitmate"
          >
            <Text style={[styles.segmentText, activeSegment === 'ai' && styles.segmentTextActive]}>
              Trợ lý AI Fitmate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {categories.map((c) => {
            const isSelected = c.key === selectedCategory;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => onCategoryChange(c.key)}
                accessibilityRole="button"
                accessibilityLabel={`Lọc theo ${c.label}`}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Safety Notice Banner */}
      <View style={styles.safetyBanner}>
        <ShieldAlert size={16} color="#0284C7" />
        <Text style={styles.safetyText}>
          Tôn trọng quy tắc cộng đồng Fitmate: Luôn giữ văn hóa khích lệ và không chia sẻ công khai
          chỉ số bệnh lý nhạy cảm.
        </Text>
      </View>

      {/* Quick Post Creation Trigger */}
      <Card style={styles.createCard}>
        <TouchableOpacity
          style={styles.createTriggerRow}
          onPress={onCreatePostPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Tạo bài viết mới"
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>M</Text>
          </View>
          <View style={styles.inputPlaceholderBox}>
            <Text style={styles.inputPlaceholderText}>Chia sẻ kinh nghiệm tập luyện hôm nay...</Text>
          </View>
        </TouchableOpacity>
      </Card>
      </>}

      {/* Posts Feed */}
      <View style={styles.postsList}>
        {posts.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={showFeedChrome ? 'Tạo bài viết' : undefined}
            onAction={showFeedChrome ? onCreatePostPress : undefined}
          />
        ) : posts.map((post) => (
          <Card key={post.id} style={styles.postCard}>
            {/* Header: Author & Options */}
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.authorRow}
                onPress={() => onAuthorPress(post.authorId)}
                accessibilityRole="button"
                accessibilityLabel={`Xem hồ sơ của ${post.authorName}`}
              >
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorInitial}>{post.authorName.charAt(0)}</Text>
                </View>
                <View>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    {post.authorRole === 'pt' && (
                      <View style={styles.ptBadge}>
                        <Text style={styles.ptBadgeText}>PT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.postTime}>{post.createdAt}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onReportPress(post.id)}
                style={styles.moreBtn}
                accessibilityRole="button"
                accessibilityLabel="Thao tác bài viết hoặc báo cáo"
              >
                <MoreVertical size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Post Content */}
            <View>
              <Text style={styles.postContent}>{post.content}</Text>
              {(post.mediaUrls?.length || post.mediaUrl) ? (
                <>
                <View style={styles.mediaContainer}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaCarousel}
                    onMomentumScrollEnd={(event) => {
                      const offsetX = event.nativeEvent?.contentOffset?.x ?? 0;
                      const pageIndex = Math.round(offsetX / mediaWidth);
                      setActiveMedia((current) => ({ ...current, [post.id]: pageIndex }));
                    }}
                  >
                    {(post.mediaUrls?.length ? post.mediaUrls : [post.mediaUrl!]).map((uri, index, all) => (
                      <View key={`${uri}-${index}`} style={[styles.feedMediaFrame, { width: mediaWidth }]}>
                        <Image source={{ uri }} style={styles.feedMedia} accessibilityRole="image" accessibilityLabel={`Ảnh ${index + 1} trên ${all.length}`} />
                      </View>
                    ))}
                  </ScrollView>
                  {(post.mediaUrls?.length || 0) > 1 && (
                    <View style={styles.mediaCounter} pointerEvents="none">
                      <Text style={styles.mediaCounterText}>{Math.min((activeMedia[post.id] || 0) + 1, post.mediaUrls!.length)}/{post.mediaUrls!.length}</Text>
                    </View>
                  )}
                </View>
                {(post.mediaUrls?.length || 0) > 1 && <View style={styles.paginationDots}>{post.mediaUrls!.map((_, index) => <View key={index} style={[styles.paginationDot, (activeMedia[post.id] || 0) === index && styles.paginationDotActive]} />)}</View>}
                </>
              ) : null}
              {(post.workoutTags?.length || post.mealTags?.length || post.isKnowledgeSharing) ? (
                <View style={styles.feedTags}>
                  {[...(post.workoutTags || []), ...(post.mealTags || [])].slice(0, 4).map((tag) => <Text key={tag} style={styles.feedTag}>#{tag}</Text>)}
                  {post.isKnowledgeSharing && <Text style={styles.feedTag}>#kiến_thức</Text>}
                </View>
              ) : null}
            </View>

            {/* Reactions & Actions Row */}
            <View style={styles.reactionsBar}>
              <View style={styles.reactionsGroup}>
                <TouchableOpacity
                  style={[
                    styles.reactionBtn,
                    post.reactions.userReaction === 'love' && styles.reactionBtnActive,
                  ]}
                  onPress={() => onReaction(post.id, 'love')}
                  accessibilityRole="button"
                  accessibilityLabel="Thả tim"
                >
                  <Heart
                    size={24}
                    color={post.reactions.userReaction === 'love' ? '#DC2626' : colors.textSecondary}
                    fill={post.reactions.userReaction === 'love' ? '#DC2626' : 'transparent'}
                  />
                  {post.reactions.love > 0 && <Text style={styles.reactionCount}>{post.reactions.love}</Text>}
                </TouchableOpacity>
              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => onSelectPost(post.id)}
                accessibilityRole="button"
                accessibilityLabel="Xem bình luận"
              >
                <MessageCircle size={24} color={colors.textSecondary} />
                {post.commentCount > 0 && <Text style={styles.reactionCount}>{post.commentCount}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactionBtn} onPress={() => onSharePost(post.id)} accessibilityLabel="Chia sẻ cho bạn bè"><Send size={24} color={colors.textSecondary} /></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.reactionBtn} onPress={() => onBookmarkPost(post.id)} accessibilityLabel={post.savedByViewer ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}><Bookmark size={24} color={colors.textSecondary} fill={post.savedByViewer ? colors.textSecondary : 'transparent'} /></TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 112,
  },
  segmentedContainer: {
    gap: spacing.sm,
  },
  segmentedTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 3,
    borderRadius: radius.full,
    gap: 2,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#EFF6FF',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  safetyText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
  createCard: {
    padding: spacing.sm,
  },
  createTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  inputPlaceholderBox: {
    flex: 1,
    height: 38,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  inputPlaceholderText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  postsList: {
    gap: spacing.md,
  },
  postCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ptBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  ptBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  postTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moreBtn: {
    padding: 4,
  },
  postContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  mediaContainer: { position: 'relative', marginTop: spacing.sm },
  mediaCarousel: { borderRadius: radius.md },
  feedMediaFrame: { height: 320, backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, overflow: 'hidden' },
  feedMedia: { width: '100%', height: '100%', resizeMode: 'cover' },
  mediaCounter: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1, backgroundColor: 'rgba(15,23,42,0.72)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.full },
  mediaCounterText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  feedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: spacing.xs },
  feedTag: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    marginTop: 4,
  },
  reactionsGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  reactionBtnActive: {
    backgroundColor: '#F1F5F9',
  },
  reactionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  commentCountText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingTop: spacing.xs },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  paginationDotActive: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
});
