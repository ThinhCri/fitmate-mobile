import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { AppTopBar, ErrorState, LoadingSkeleton } from '@/components/design-system';
import { CommunityFeedPresentation, CommunityPostViewModel, FriendItemViewModel, SharePostSheet } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function SavedPostsScreen() {
  const [posts, setPosts] = useState<CommunityPostViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<CommunityPostViewModel | null>(null);
  const [friends, setFriends] = useState<FriendItemViewModel[]>([]);
  const [sharing, setSharing] = useState(false);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppTopBar title="Bài viết đã lưu" onBack={() => router.back()} />
      {loading ? <LoadingSkeleton count={3} /> : error ? (
        <ErrorState title="Không thể tải bài viết đã lưu" description={error} onAction={() => void load()} />
      ) : (
        <CommunityFeedPresentation
          posts={posts}
          activeSegment="community"
          selectedCategory="all"
          showFeedChrome={false}
          emptyTitle="Chưa có bài viết đã lưu"
          emptyDescription="Nhấn biểu tượng lưu ở một bài viết để xem lại tại đây."
          onSegmentChange={() => undefined}
          onCategoryChange={() => undefined}
          onReaction={async (postId, type) => { try { const result = await getSocialRepository().reactToPost(postId, type); setPosts((current) => current.map((post) => post.id === postId ? { ...post, reactions: { ...post.reactions, love: result.count, userReaction: result.active ? 'love' : undefined } } : post)); } catch (cause) { Alert.alert('Không thể thả cảm xúc', cause instanceof Error ? cause.message : 'Vui lòng thử lại.'); } }}
          onSelectPost={(postId) => router.push(`/community/post/${postId}` as never)}
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
          onReportPress={(postId) => router.push(`/community/post/${postId}` as never)}
          onAuthorPress={(authorId) => router.push(`/community/user/${authorId}` as never)}
        />
      )}
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
    </SafeAreaView>
  );
}
