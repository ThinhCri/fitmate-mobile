import { CommunityPostViewModel, FriendItemViewModel, ReportRequest } from '@/features/community';
import { ConversationDetailViewModel, ChatMessageViewModel } from '@/features/chat';
import type { ISocialRepository } from '../socialRepository';

let previewFriends: FriendItemViewModel[] = [
  {
    id: 'user-101',
    name: 'Lê Quốc Bảo',
    role: 'member',
    isOnline: true,
    mutualFriendsCount: 4,
    relationship: 'friend',
    headline: 'Chung sở thích Calisthenics',
  },
  {
    id: 'pt-202',
    name: 'HLV Minh Tuấn',
    role: 'pt',
    isOnline: false,
    mutualFriendsCount: 8,
    relationship: 'friend',
    headline: 'HLV Dinh dưỡng & Thể hình',
  },
];

let previewPending: FriendItemViewModel[] = [
  {
    id: 'user-303',
    name: 'Đặng Thu Trang',
    role: 'member',
    isOnline: true,
    mutualFriendsCount: 4,
    relationship: 'received_request',
    requestDate: '1 ngày trước',
    headline: 'Cùng tập Pilates',
  },
];

let previewSent: FriendItemViewModel[] = [
  {
    id: 'user-404',
    name: 'Nguyễn Văn Hùng',
    role: 'member',
    isOnline: false,
    mutualFriendsCount: 2,
    relationship: 'sent_request',
    headline: 'Chạy bộ bán chuyên',
  },
];

let previewDiscover: FriendItemViewModel[] = [
  {
    id: 'user-505',
    name: 'Hoàng Yến',
    role: 'member',
    isOnline: true,
    mutualFriendsCount: 1,
    relationship: 'sent_request',
    headline: 'Thích Yoga & Gym',
  },
];

let previewPosts: CommunityPostViewModel[] = [
  {
    id: 'post-preview-1',
    authorId: 'user-101',
    authorName: 'Lê Quốc Bảo',
    authorRole: 'member',
    content: 'Hôm nay mình đã hoàn thành buổi tập toàn thân. Cùng cố gắng nhé!',
    category: 'workout_exp',
    visibility: 'public',
    createdAt: 'Vừa xong',
    reactions: { love: 4, fire: 2, smile: 1 },
    commentCount: 0,
    isKnowledgeSharing: false,
  },
];

export class PreviewSocialRepository implements ISocialRepository {
  async listPosts(scope: 'public' | 'friends' = 'public'): Promise<CommunityPostViewModel[]> {
    return previewPosts.filter((post) => scope === 'public' || post.visibility === 'friends');
  }

  async reactToPost(postId: string, type: 'love' | 'fire' | 'smile'): Promise<void> {
    previewPosts = previewPosts.map((post) =>
      post.id === postId
        ? {
            ...post,
            reactions: {
              ...post.reactions,
              [type]: post.reactions[type] + 1,
              userReaction: type,
            },
          }
        : post
    );
  }

  async getFriends(): Promise<{
    friends: FriendItemViewModel[];
    pendingRequests: FriendItemViewModel[];
    sentRequests: FriendItemViewModel[];
    discoverUsers: FriendItemViewModel[];
  }> {
    return {
      friends: [...previewFriends],
      pendingRequests: [...previewPending],
      sentRequests: [...previewSent],
      discoverUsers: [...previewDiscover],
    };
  }

  async sendFriendRequest(targetUserId: string): Promise<void> {
    const user = previewDiscover.find((u) => u.id === targetUserId);
    if (user) {
      previewDiscover = previewDiscover.filter((u) => u.id !== targetUserId);
      previewSent.push({
        ...user,
        relationship: 'sent_request',
      });
    }
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    const user = previewPending.find((u) => u.id === requestId);
    if (user) {
      previewPending = previewPending.filter((u) => u.id !== requestId);
      previewFriends.push({
        ...user,
        relationship: 'friend',
      });
    }
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    previewPending = previewPending.filter((u) => u.id !== requestId);
  }

  async unfriend(targetUserId: string): Promise<void> {
    previewFriends = previewFriends.filter((u) => u.id !== targetUserId);
  }

  async getConversation(id: string): Promise<ConversationDetailViewModel> {
    const isRestricted = id === 'conv-3';
    return {
      id: id || 'conv-1',
      participantId: 'pt-101',
      participantName: isRestricted ? 'Bùi Tiến Dũng' : 'HLV Hoàng Nam',
      participantRole: isRestricted ? 'member' : 'pt',
      isOnline: !isRestricted,
      isRestricted,
      messages: [
        {
          id: 'm-1',
          senderId: 'pt-101',
          senderName: isRestricted ? 'Bùi Tiến Dũng' : 'HLV Hoàng Nam',
          text: isRestricted
            ? 'Chào bạn, tuần trước tập bài lưng xong cơ lưng xô phát triển tốt lắm!'
            : 'Chào bạn, buổi tập tối nay 18:00 nhớ khởi động kỹ khớp vai nhé!',
          timestamp: '17:45',
          status: 'read',
          isSelf: false,
        },
        {
          id: 'm-2',
          senderId: 'my-id',
          senderName: 'Tôi',
          text: 'Vâng ạ, em đã sẵn sàng rồi!',
          timestamp: '17:46',
          status: 'read',
          isSelf: true,
        },
      ],
    };
  }

  async sendMessage(_conversationId: string, text: string): Promise<ChatMessageViewModel> {
    return {
      id: `m-${Date.now()}`,
      senderId: 'my-id',
      senderName: 'Tôi',
      text,
      timestamp: 'Vừa xong',
      status: 'sent',
      isSelf: true,
    };
  }

  async reportOrBlockUser(_request: ReportRequest): Promise<void> {
    // In preview mode, silently accept
  }
}

export const previewSocialRepository = new PreviewSocialRepository();
