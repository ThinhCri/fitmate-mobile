import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MessageCircle, UserSearch } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ErrorState, LoadingSkeleton } from '@/components/design-system/FeedbackStates';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CommunityFeedPresentation, CommunityPostViewModel } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { colors } from '@/theme/designTokens';

type FeedCategory = 'all' | 'friends' | 'workout_exp' | 'nutrition_qa';

export default function SocialScreen() {
  const [posts, setPosts] = useState<CommunityPostViewModel[]>([]);
  const [category, setCategory] = useState<FeedCategory>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleReaction = async (postId: string, type: 'love' | 'fire' | 'smile') => {
    try {
      await getSocialRepository().reactToPost(postId, type);
      await loadPosts(category === 'friends' ? 'friends' : 'public');
    } catch (cause) {
      Alert.alert('Không thể thả cảm xúc', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    }
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
          onSelectPost={(postId) => router.push(`/community/post/${postId}` as any)}
          onCreatePostPress={() => router.push('/community/create-post' as any)}
          onSearchFriendsPress={() => router.push('/community/friends' as any)}
          onChatInboxPress={() => router.push('/chat' as any)}
          onReportPress={(postId) => router.push(`/community/post/${postId}` as any)}
          onAuthorPress={(authorId) => router.push(`/community/user/${authorId}` as any)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
