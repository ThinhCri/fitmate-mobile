import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MessageCircle, UserSearch } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ConfirmationModal } from '@/components/design-system';
import { ErrorState, LoadingSkeleton } from '@/components/design-system/FeedbackStates';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CommentsSheet, CommunityFeedPresentation, CommunityPostViewModel, FriendItemViewModel, PostActionsSheet, ReportBlockModal, ReportRequest, SharePostSheet } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { colors } from '@/theme/designTokens';

export default function SocialScreen() {
  const [posts, setPosts] = useState<CommunityPostViewModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentPost, setCommentPost] = useState<CommunityPostViewModel | null>(null);
  const [sharePost, setSharePost] = useState<CommunityPostViewModel | null>(null);
  const [friends, setFriends] = useState<FriendItemViewModel[]>([]);
  const [sharing, setSharing] = useState(false);
  const [optionsPost, setOptionsPost] = useState<CommunityPostViewModel | null>(null);
  const [reportPost, setReportPost] = useState<CommunityPostViewModel | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{ type: 'delete' | 'block'; post: CommunityPostViewModel } | null>(null);
  const latestRequest = useRef(0);
  const loaded = useRef(false);

  const loadPosts = useCallback(async (query = '') => {
    const requestId = ++latestRequest.current;
    try {
      const result = await getSocialRepository().listPosts('public', query);
      if (requestId !== latestRequest.current) return;
      loaded.current = true;
      setPosts(result);
      setError(null);
    } catch (cause) {
      if (requestId !== latestRequest.current) return;
      setError(cause instanceof Error ? cause.message : 'Không thể tải bảng tin cộng đồng.');
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(useCallback(() => {
    void loadPosts(debouncedQuery);
  }, [debouncedQuery, loadPosts]));

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
    setOptionsPost(post);
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
      ) : error && !loaded.current ? (
        <ErrorState title="Không thể tải cộng đồng" description={error} onAction={() => void loadPosts(debouncedQuery)} />
      ) : (
        <>
        {error && <Text style={{ color: colors.danger, padding: 12 }}>Chưa cập nhật được bảng tin. Đang hiển thị dữ liệu đã tải.</Text>}
        <CommunityFeedPresentation
          posts={posts}
          activeSegment="community"
          onSegmentChange={(segment) => { if (segment === 'ai') router.push('/ai' as any); }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          emptyTitle={debouncedQuery ? 'Không tìm thấy bài viết' : undefined}
          emptyDescription={debouncedQuery ? 'Hãy thử từ khóa khác hoặc nhập hashtag, ví dụ #gym.' : undefined}
          onReaction={(postId, type) => void handleReaction(postId, type)}
          onSelectPost={(postId) => void openComments(postId)}
          onSharePost={(postId) => void openShare(postId)}
          onBookmarkPost={(postId) => void getSocialRepository().toggleBookmark(postId).then((result) => setPosts((current) => current.map((post) => post.id === postId ? { ...post, savedByViewer: result.active } : post))).catch((cause) => Alert.alert('Không thể lưu bài viết', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'))}
          onCreatePostPress={() => router.push('/community/create-post' as any)}
          onReportPress={openOptions}
          onAuthorPress={(authorId) => router.push(`/community/user/${authorId}` as any)}
        />
        </>
      )}
      <CommentsSheet visible={Boolean(commentPost)} post={commentPost} onClose={() => { setCommentPost(null); void loadPosts(debouncedQuery); }} onSend={async (text, parentId) => { if (!commentPost) return false; try { const comment = await getSocialRepository().addComment(commentPost.id, text, parentId); setCommentPost((current) => current ? { ...current, comments: [...(current.comments || []), comment], commentCount: current.commentCount + 1 } : current); return true; } catch (cause) { Alert.alert('Không thể bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); return false; } }} onLike={async (commentId) => { if (!commentPost) return; try { const result = await getSocialRepository().toggleCommentLike(commentId); setCommentPost((current) => current ? { ...current, comments: current.comments?.map((comment) => comment.id === commentId ? { ...comment, likesCount: result.count, likedByViewer: result.active } : comment) } : current); } catch (cause) { Alert.alert('Không thể thích bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } }} />
      <SharePostSheet visible={Boolean(sharePost)} friends={friends} sending={sharing} onClose={() => setSharePost(null)} onSend={async (friendIds) => { if (!sharePost) return; setSharing(true); try { const preview = sharePost.content.length > 90 ? `${sharePost.content.slice(0, 90)}…` : sharePost.content; await Promise.all(friendIds.map((friendId) => getSocialRepository().sendMessage(friendId, `Đã chia sẻ một bài viết của ${sharePost.authorName}:\n${preview}\nfitmate://community/post/${sharePost.id}`))); Alert.alert('Đã chia sẻ', `Đã gửi bài viết cho ${friendIds.length} người bạn.`); setSharePost(null); } catch (cause) { Alert.alert('Không thể chia sẻ', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } finally { setSharing(false); } }} />
      <PostActionsSheet
        post={optionsPost}
        onClose={() => setOptionsPost(null)}
        onEdit={(post) => { setOptionsPost(null); router.push({ pathname: '/community/create-post', params: { id: post.id } } as never); }}
        onDelete={(post) => { setOptionsPost(null); setPendingConfirm({ type: 'delete', post }); }}
        onReport={(post) => { setOptionsPost(null); setReportPost(post); }}
        onBlock={(post) => { setOptionsPost(null); setPendingConfirm({ type: 'block', post }); }}
      />
      <ConfirmationModal
        visible={Boolean(pendingConfirm)}
        title={pendingConfirm?.type === 'delete' ? 'Xóa bài viết?' : 'Chặn người dùng?'}
        message={pendingConfirm?.type === 'delete'
          ? 'Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục.'
          : `Bạn và ${pendingConfirm?.post.authorName ?? 'người này'} sẽ không thể xem bài viết hoặc tương tác với nhau.`}
        confirmLabel={pendingConfirm?.type === 'delete' ? 'Xóa bài viết' : 'Chặn người dùng'}
        cancelLabel="Hủy"
        destructive
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          const action = pendingConfirm;
          setPendingConfirm(null);
          if (!action) return;
          void (async () => {
            try {
              if (action.type === 'delete') {
                await getSocialRepository().deletePost(action.post.id);
                setPosts((current) => current.filter((item) => item.id !== action.post.id));
              } else {
                await getSocialRepository().blockUser(action.post.authorId);
                await loadPosts(debouncedQuery);
                Alert.alert('Đã chặn', `Bạn đã chặn ${action.post.authorName}.`);
              }
            } catch (cause) {
              Alert.alert(action.type === 'delete' ? 'Không thể xóa bài viết' : 'Không thể chặn người dùng', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
            }
          })();
        }}
      />
      {reportPost && <ReportBlockModal visible targetId={reportPost.id} targetType="post" targetAuthorId={reportPost.authorId} targetAuthorName={reportPost.authorName} targetSummary={reportPost.content.slice(0, 80)} showBlockAction={false} onClose={() => setReportPost(null)} onSubmitReport={async (request: ReportRequest) => { try { await getSocialRepository().reportOrBlockUser(request); return true; } catch { return false; } }} />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
