import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  PublicProfilePresentation,
  ReportBlockModal,
  UserPublicProfileViewModel,
  ReportRequest,
} from '@/features/community';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [profile, setProfile] = useState<UserPublicProfileViewModel>({
    id: id || 'user-101',
    name: 'Lê Quốc Bảo',
    role: 'member',
    bio: 'Đam mê Calisthenics & Street Workout. Đang theo đuổi mục tiêu 20 Muscle-up liên tục!',
    isVerified: true,
    friendshipStatus: 'friend',
    friendCount: 24,
    postCount: 18,
    completedWorkoutsCount: 120,
    posts: [
      {
        id: 'post-p1',
        authorId: id || 'user-101',
        authorName: 'Lê Quốc Bảo',
        authorRole: 'member',
        content: 'Hoàn thành buổi tập kéo xà sáng sớm. Thời tiết hôm nay mát mẻ, năng lượng tràn đầy!',
        category: 'workout_exp',
        visibility: 'public',
        createdAt: 'Hôm nay 06:45',
        reactions: { love: 18, fire: 12, smile: 4 },
        commentCount: 3,
      },
    ],
  });

  const [reportModalVisible, setReportModalVisible] = useState(false);

  const handleSendFriendRequest = () => {
    setProfile((prev) => ({ ...prev, friendshipStatus: 'request_sent' }));
  };

  const handleCancelFriendRequest = () => {
    setProfile((prev) => ({ ...prev, friendshipStatus: 'none' }));
  };

  const handleAcceptFriendRequest = () => {
    setProfile((prev) => ({
      ...prev,
      friendshipStatus: 'friend',
      friendCount: prev.friendCount + 1,
    }));
  };

  const handleRejectFriendRequest = () => {
    setProfile((prev) => ({ ...prev, friendshipStatus: 'none' }));
  };

  const handleUnfriend = () => {
    setProfile((prev) => ({
      ...prev,
      friendshipStatus: 'none',
      friendCount: Math.max(0, prev.friendCount - 1),
    }));
  };

  const handleMessagePress = () => {
    router.push(`/chat/${profile.id}` as any);
  };

  const handleSubmitReport = (report: ReportRequest) => {
    console.log('Report user submitted:', report);
  };

  const handleConfirmBlock = (userId: string) => {
    console.log('User blocked:', userId);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <PublicProfilePresentation
        profile={profile}
        isSelf={false}
        onBack={() => router.back()}
        onSendFriendRequest={handleSendFriendRequest}
        onCancelFriendRequest={handleCancelFriendRequest}
        onAcceptFriendRequest={handleAcceptFriendRequest}
        onRejectFriendRequest={handleRejectFriendRequest}
        onUnfriend={handleUnfriend}
        onMessagePress={handleMessagePress}
        onViewPtProfile={(ptId) =>
          router.push(`/booking/select-slot?ptId=${ptId}` as any)
        }
        onSelectPost={(postId) =>
          router.push(`/community/post/${postId}` as any)
        }
        onReportPress={() => setReportModalVisible(true)}
        onBlockPress={() => setReportModalVisible(true)}
      />

      <ReportBlockModal
        visible={reportModalVisible}
        targetId={profile.id}
        targetType="user"
        targetAuthorId={profile.id}
        targetAuthorName={profile.name}
        onClose={() => setReportModalVisible(false)}
        onSubmitReport={handleSubmitReport}
        onConfirmBlock={handleConfirmBlock}
      />
    </SafeAreaView>
  );
}
