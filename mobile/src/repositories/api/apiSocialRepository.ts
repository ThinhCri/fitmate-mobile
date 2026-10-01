import { FriendItemViewModel, ReportRequest } from '@/features/community';
import { ConversationDetailViewModel, ChatMessageViewModel } from '@/features/chat';
import type { ISocialRepository } from '../socialRepository';
import { ApiError } from '@/services/api/client';

export class ApiSocialRepository implements ISocialRepository {
  async getFriends(): Promise<{
    friends: FriendItemViewModel[];
    pendingRequests: FriendItemViewModel[];
    sentRequests: FriendItemViewModel[];
    discoverUsers: FriendItemViewModel[];
  }> {
    throw new ApiError('Friends list API endpoint not available', 501);
  }

  async sendFriendRequest(_targetUserId: string): Promise<void> {
    throw new ApiError('Send friend request API endpoint not available', 501);
  }

  async acceptFriendRequest(_requestId: string): Promise<void> {
    throw new ApiError('Accept friend request API endpoint not available', 501);
  }

  async rejectFriendRequest(_requestId: string): Promise<void> {
    throw new ApiError('Reject friend request API endpoint not available', 501);
  }

  async unfriend(_targetUserId: string): Promise<void> {
    throw new ApiError('Unfriend API endpoint not available', 501);
  }

  async getConversation(id: string): Promise<ConversationDetailViewModel> {
    throw new ApiError(`Conversation API endpoint for ${id} not available`, 501);
  }

  async sendMessage(_conversationId: string, _text: string): Promise<ChatMessageViewModel> {
    throw new ApiError('Send message API endpoint not available', 501);
  }

  async reportOrBlockUser(_request: ReportRequest): Promise<void> {
    throw new ApiError('Report/block user API endpoint not available', 501);
  }
}

export const apiSocialRepository = new ApiSocialRepository();
