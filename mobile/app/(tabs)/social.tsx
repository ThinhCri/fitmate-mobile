import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MessageCircle, UserSearch } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ErrorState, LoadingSkeleton } from '@/components/design-system/FeedbackStates';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CommentsSheet, CommunityFeedPresentation, CommunityPostViewModel, FriendItemViewModel, ReportBlockModal, ReportRequest, SharePostSheet } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { colors } from '@/theme/designTokens';

type FeedCategory = 'all' | 'friends' | 'workout_exp' | 'nutrition_qa';

export default function SocialScreen() {
  const [posts, setPosts] = useState<CommunityPostViewModel[]>([]);
  const [category, setCategory] = useState<FeedCategory>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentPost, setCommentPost] = useState<CommunityPostViewModel | null>(null);
  const [sharePost, setSharePost] = useState<CommunityPostViewModel | null>(null);
  const [friends, setFriends] = useState<FriendItemViewModel[]>([]);
  const [sharing, setSharing] = useState(false);
  const [reportPost, setReportPost] = useState<CommunityPostViewModel | null>(null);

  const loadPosts = useCallback(async (scope: 'public' | 'friends' = 'public') => {
    setLoading(true);
    try {
      setPosts(await getSocialRepository().listPosts(scope));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải bảng tin cộng đồng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadPosts(category === 'friends' ? 'friends' : 'public');
  }, [category, loadPosts]));

  const handleCategoryChange = (next: FeedCategory) => {
    setCategory(next);
  };

  const visiblePosts = posts.filter((post) => category === 'all' || category === 'friends' || post.category === category);

  const handleReaction = async (postId: string, type: 'love') => {
    try {
      const result = await getSocialRepository().reactToPost(postId, type);
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, reactions: { ...post.reactions, love: result.count, userReaction: result.active ? 'love' : undefined } } : post));
    } catch (cause) {
      Alert.alert('Không thể thả cảm xúc', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    }
  };

  const openComments = async (postId: string) => {
    try { setCommentPost(await getSocialRepository().getPost(postId)); }
    catch (cause) { Alert.alert('Không thể tải bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); }
  };

  const openShare = async (postId: string) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    try { const result = await getSocialRepository().getFriends(); setFriends(result.friends); setSharePost(post); }
    catch (cause) { Alert.alert('Không thể tải bạn bè', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); }
  };

  const openOptions = (postId: string) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    if (!post.isOwner) { setReportPost(post); return; }
    Alert.alert('Tùy chọn bài viết', undefined, [
      { text: 'Chỉnh sửa', onPress: () => router.push({ pathname: '/community/create-post', params: { id: post.id, content: post.content } } as never) },
      { text: 'Xóa bài viết', style: 'destructive', onPress: () => Alert.alert('Xóa bài viết?', 'Thao tác này không thể hoàn tác.', [{ text: 'Hủy', style: 'cancel' }, { text: 'Xóa', style: 'destructive', onPress: async () => { await getSocialRepository().deletePost(post.id); setPosts((current) => current.filter((item) => item.id !== post.id)); } }]) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar
        title="Cộng đồng"
        hideDivider
        rightAction={(
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => router.push('/community/friends' as any)} style={styles.iconButton} accessibilityLabel="Tìm bạn bè">
              <UserSearch size={21} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/chat' as any)} style={styles.iconButton} accessibilityLabel="Mở hộp thư">
              <MessageCircle size={21} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      />
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState title="Không thể tải cộng đồng" description={error} onAction={() => void loadPosts(category === 'friends' ? 'friends' : 'public')} />
      ) : (
        <CommunityFeedPresentation
          posts={visiblePosts}
          activeSegment="community"
          selectedCategory={category}
          onSegmentChange={(segment) => { if (segment === 'ai') router.push('/ai' as any); }}
          onCategoryChange={handleCategoryChange}
          onReaction={(postId, type) => void handleReaction(postId, type)}
          onSelectPost={(postId) => void openComments(postId)}
          onSharePost={(postId) => void openShare(postId)}
          onBookmarkPost={(postId) => void getSocialRepository().toggleBookmark(postId).then((result) => setPosts((current) => current.map((post) => post.id === postId ? { ...post, savedByViewer: result.active } : post))).catch((cause) => Alert.alert('Không thể lưu bài viết', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'))}
          onCreatePostPress={() => router.push('/community/create-post' as any)}
          onReportPress={openOptions}
          onAuthorPress={(authorId) => router.push(`/community/user/${authorId}` as any)}
        />
      )}
      <CommentsSheet visible={Boolean(commentPost)} post={commentPost} onClose={() => { setCommentPost(null); void loadPosts('public'); }} onSend={async (text, parentId) => { if (!commentPost) return false; try { const comment = await getSocialRepository().addComment(commentPost.id, text, parentId); setCommentPost((current) => current ? { ...current, comments: [...(current.comments || []), comment], commentCount: current.commentCount + 1 } : current); return true; } catch (cause) { Alert.alert('Không thể bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); return false; } }} onLike={async (commentId) => { if (!commentPost) return; try { const result = await getSocialRepository().toggleCommentLike(commentId); setCommentPost((current) => current ? { ...current, comments: current.comments?.map((comment) => comment.id === commentId ? { ...comment, likesCount: result.count, likedByViewer: result.active } : comment) } : current); } catch (cause) { Alert.alert('Không thể thích bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } }} />
      <SharePostSheet visible={Boolean(sharePost)} friends={friends} sending={sharing} onClose={() => setSharePost(null)} onSend={async (friendIds) => { if (!sharePost) return; setSharing(true); try { const preview = sharePost.content.length > 90 ? `${sharePost.content.slice(0, 90)}…` : sharePost.content; await Promise.all(friendIds.map((friendId) => getSocialRepository().sendMessage(friendId, `Đã chia sẻ một bài viết của ${sharePost.authorName}:\n${preview}\nfitmate://community/post/${sharePost.id}`))); Alert.alert('Đã chia sẻ', `Đã gửi bài viết cho ${friendIds.length} người bạn.`); setSharePost(null); } catch (cause) { Alert.alert('Không thể chia sẻ', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } finally { setSharing(false); } }} />
      {reportPost && <ReportBlockModal visible targetId={reportPost.id} targetType="post" targetAuthorId={reportPost.authorId} targetAuthorName={reportPost.authorName} targetSummary={reportPost.content.slice(0, 80)} onClose={() => setReportPost(null)} onSubmitReport={async (request: ReportRequest) => { try { await getSocialRepository().reportOrBlockUser(request); setReportPost(null); Alert.alert('Đã gửi báo cáo', 'Fitmate đã tiếp nhận báo cáo của bạn.'); return true; } catch { return false; } }} onConfirmBlock={async (userId) => { try { await getSocialRepository().blockUser(userId); setReportPost(null); await loadPosts('public'); return true; } catch { return false; } }} />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
