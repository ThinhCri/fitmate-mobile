import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  PostDetailPresentation,
  ReportBlockModal,
  CommunityPostViewModel,
  ReportRequest,
} from '@/features/community';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Sample view model for presentation
  const [post, setPost] = useState<CommunityPostViewModel>({
    id: id || 'post-1',
    authorId: 'pt-101',
    authorName: 'HLV Trần Thùy Linh',
    authorRole: 'pt',
    authorVerified: true,
    content:
      'Hôm nay hướng dẫn học viên bài đẩy ngực với tạ đôi (Dumbbell Bench Press). Chú ý pha hạ tạ (eccentric) cần kiểm soát chậm 3 giây để kích hoạt cơ ngực tối đa mà không gây áp lực xấu lên khớp vai!',
    mediaUrl:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    category: 'workout_exp',
    visibility: 'public',
    createdAt: '2 giờ trước',
    reactions: {
      love: 64,
      fire: 42,
      smile: 18,
    },
    commentCount: 2,
    workoutTags: ['Upper Body', 'Dumbbell Press'],
    isKnowledgeSharing: true,
    comments: [
      {
        id: 'c-1',
        authorId: 'member-2',
        authorName: 'Minh Anh',
        authorRole: 'member',
        text: 'Cảm ơn HLV Thùy Linh, trước đây em hay bị nhói khớp vai khi đẩy nặng, sau khi kiểm soát hạ chậm thấy đỡ hẳn ạ!',
        createdAt: '1 giờ trước',
      },
      {
        id: 'c-2',
        authorId: 'pt-101',
        authorName: 'HLV Trần Thùy Linh',
        authorRole: 'pt',
        text: '@Minh Anh Tuyệt vời em nhé! Nhớ khóa xương bả vai (retract scapula) trước khi hạ.',
        createdAt: '30 phút trước',
        isOwner: true,
      },
    ],
  });

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    targetType: 'post' | 'comment' | 'user';
    targetId: string;
    authorName: string;
  }>({
    targetType: 'post',
    targetId: post.id,
    authorName: post.authorName,
  });

  const handleReaction = (type: 'love' | 'fire' | 'smile') => {
    setPost((prev) => {
      const isAlready = prev.reactions.userReaction === type;
      const countDiff = isAlready ? -1 : 1;
      return {
        ...prev,
        reactions: {
          ...prev.reactions,
          [type]: prev.reactions[type] + countDiff,
          userReaction: isAlready ? undefined : type,
        },
      };
    });
  };

  const handleAddComment = (text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorId: 'my-user-id',
      authorName: 'Tôi',
      authorRole: 'member' as const,
      text,
      createdAt: 'Vừa xong',
      isOwner: true,
    };
    setPost((prev) => ({
      ...prev,
      commentCount: prev.commentCount + 1,
      comments: [...(prev.comments || []), newComment],
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    setPost((prev) => ({
      ...prev,
      commentCount: Math.max(0, prev.commentCount - 1),
      comments: (prev.comments || []).filter((c) => c.id !== commentId),
    }));
  };

  const handleReportPress = (
    targetType: 'post' | 'comment',
    targetId: string,
    authorName: string
  ) => {
    setReportTarget({ targetType, targetId, authorName });
    setReportModalVisible(true);
  };

  const handleSubmitReport = (report: ReportRequest) => {
    // Client-side report dispatch
    console.log('Report submitted:', report);
  };

  const handleConfirmBlock = (userId: string) => {
    console.log('User blocked:', userId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <PostDetailPresentation
        post={post}
        onBack={() => router.back()}
        onReaction={handleReaction}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onReportPress={handleReportPress}
        onAuthorPress={(authorId) =>
          router.push(`/community/user/${authorId}` as any)
        }
      />

      <ReportBlockModal
        visible={reportModalVisible}
        targetId={reportTarget.targetId}
        targetType={reportTarget.targetType}
        targetAuthorId="author-1"
        targetAuthorName={reportTarget.authorName}
        targetSummary={post.content.slice(0, 80)}
        onClose={() => setReportModalVisible(false)}
        onSubmitReport={handleSubmitReport}
        onConfirmBlock={handleConfirmBlock}
      />
    </SafeAreaView>
  );
}
