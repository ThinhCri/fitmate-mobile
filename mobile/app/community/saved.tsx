import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { AppTopBar, ConfirmationModal, ErrorState, LoadingSkeleton } from '@/components/design-system';
import { CommentsSheet, CommunityFeedPresentation, CommunityPostViewModel, FriendItemViewModel, PostActionsSheet, ReportBlockModal, ReportRequest, SharePostSheet } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function SavedPostsScreen() {
  const [posts, setPosts] = useState<CommunityPostViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<CommunityPostViewModel | null>(null);
  const [friends, setFriends] = useState<FriendItemViewModel[]>([]);
  const [sharing, setSharing] = useState(false);
  const [commentPost, setCommentPost] = useState<CommunityPostViewModel | null>(null);
  const [optionsPost, setOptionsPost] = useState<CommunityPostViewModel | null>(null);
  const [reportPost, setReportPost] = useState<CommunityPostViewModel | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{ type: 'delete' | 'block'; post: CommunityPostViewModel } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await getSocialRepository().listBookmarkedPosts());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải bài viết đã lưu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const openComments = async (postId: string) => {
    try { setCommentPost(await getSocialRepository().getPost(postId)); }
    catch (cause) { Alert.alert('Không thể tải bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppTopBar title="Bài viết đã lưu" onBack={() => router.back()} />
      {loading ? <LoadingSkeleton count={3} /> : error ? (
        <ErrorState title="Không thể tải bài viết đã lưu" description={error} onAction={() => void load()} />
      ) : (
        <CommunityFeedPresentation
          posts={posts}
          activeSegment="community"
          showFeedChrome={false}
          emptyTitle="Chưa có bài viết đã lưu"
          emptyDescription="Nhấn biểu tượng lưu ở một bài viết để xem lại tại đây."
          onSegmentChange={() => undefined}
          onReaction={async (postId, type) => { try { const result = await getSocialRepository().reactToPost(postId, type); setPosts((current) => current.map((post) => post.id === postId ? { ...post, reactions: { ...post.reactions, love: result.count, userReaction: result.active ? 'love' : undefined } } : post)); } catch (cause) { Alert.alert('Không thể thả cảm xúc', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } }}
          onSelectPost={(postId) => void openComments(postId)}
          onSharePost={async (postId) => {
            const post = posts.find((item) => item.id === postId);
            if (!post) return;
            try {
              const result = await getSocialRepository().getFriends();
              setFriends(result.friends);
              setSharePost(post);
            } catch (cause) {
              Alert.alert('Không thể tải bạn bè', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
            }
          }}
          onBookmarkPost={async (postId) => { try { const result = await getSocialRepository().toggleBookmark(postId); if (!result.active) setPosts((current) => current.filter((post) => post.id !== postId)); } catch (cause) { Alert.alert('Không thể bỏ lưu bài viết', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } }}
          onCreatePostPress={() => router.push('/community/create-post' as never)}
          onReportPress={(postId) => setOptionsPost(posts.find((post) => post.id === postId) ?? null)}
          onAuthorPress={(authorId) => router.push(`/community/user/${authorId}` as never)}
        />
      )}
      <CommentsSheet
        visible={Boolean(commentPost)}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        onSend={async (text, parentId) => {
          if (!commentPost) return false;
          try {
            const comment = await getSocialRepository().addComment(commentPost.id, text, parentId);
            setCommentPost((current) => current ? { ...current, comments: [...(current.comments || []), comment], commentCount: current.commentCount + 1 } : current);
            setPosts((current) => current.map((post) => post.id === commentPost.id ? { ...post, commentCount: post.commentCount + 1 } : post));
            return true;
          } catch (cause) {
            Alert.alert('Không thể bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
            return false;
          }
        }}
        onLike={async (commentId) => {
          if (!commentPost) return;
          try {
            const result = await getSocialRepository().toggleCommentLike(commentId);
            setCommentPost((current) => current ? { ...current, comments: current.comments?.map((comment) => comment.id === commentId ? { ...comment, likesCount: result.count, likedByViewer: result.active } : comment) } : current);
          } catch (cause) {
            Alert.alert('Không thể thích bình luận', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
          }
        }}
      />
      <SharePostSheet
        visible={Boolean(sharePost)}
        friends={friends}
        sending={sharing}
        onClose={() => setSharePost(null)}
        onSend={async (friendIds) => {
          if (!sharePost) return;
          setSharing(true);
          try {
            const preview = sharePost.content.length > 90 ? `${sharePost.content.slice(0, 90)}…` : sharePost.content;
            await Promise.all(friendIds.map((friendId) => getSocialRepository().sendMessage(friendId, `Đã chia sẻ một bài viết của ${sharePost.authorName}:\n${preview}\nfitmate://community/post/${sharePost.id}`)));
            setSharePost(null);
            Alert.alert('Đã chia sẻ', `Đã gửi bài viết cho ${friendIds.length} người bạn.`);
          } catch (cause) {
            Alert.alert('Không thể chia sẻ', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
          } finally {
            setSharing(false);
          }
        }}
      />
      <PostActionsSheet
        post={optionsPost}
        onClose={() => setOptionsPost(null)}
        onEdit={(post) => { setOptionsPost(null); router.push({ pathname: '/community/create-post', params: { id: post.id } } as never); }}
        onDelete={(post) => { setOptionsPost(null); setPendingConfirm({ type: 'delete', post }); }}
        onReport={(post) => { setOptionsPost(null); setReportPost(post); }}
        onBlock={(post) => { setOptionsPost(null); setPendingConfirm({ type: 'block', post }); }}
      />
      {reportPost && (
        <ReportBlockModal
          visible
          targetId={reportPost.id}
          targetType="post"
          targetAuthorId={reportPost.authorId}
          targetAuthorName={reportPost.authorName}
          targetSummary={reportPost.content.slice(0, 80)}
          showBlockAction={false}
          onClose={() => setReportPost(null)}
          onSubmitReport={async (request: ReportRequest) => {
            try { await getSocialRepository().reportOrBlockUser(request); return true; }
            catch { return false; }
          }}
        />
      )}
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
                setPosts((current) => current.filter((post) => post.id !== action.post.id));
              } else {
                await getSocialRepository().blockUser(action.post.authorId);
                setPosts((current) => current.filter((post) => post.authorId !== action.post.authorId));
                Alert.alert('Đã chặn', `Bạn đã chặn ${action.post.authorName}.`);
              }
            } catch (cause) {
              Alert.alert(action.type === 'delete' ? 'Không thể xóa bài viết' : 'Không thể chặn người dùng', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
            }
          })();
        }}
      />
    </SafeAreaView>
  );
}
