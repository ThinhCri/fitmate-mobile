import { FriendItemViewModel, ReportRequest } from '@/features/community';
import { ConversationDetailViewModel, ChatMessageViewModel } from '@/features/chat';
import { getDataSourceMode } from './repositoryTypes';
import { apiSocialRepository } from './api/apiSocialRepository';
import { previewSocialRepository } from './preview/previewSocialRepository';

export interface ISocialRepository {
  getFriends(): Promise<{
    friends: FriendItemViewModel[];
    pendingRequests: FriendItemViewModel[];
    sentRequests: FriendItemViewModel[];
    discoverUsers: FriendItemViewModel[];
  }>;
  sendFriendRequest(targetUserId: string): Promise<void>;
  acceptFriendRequest(requestId: string): Promise<void>;
  rejectFriendRequest(requestId: string): Promise<void>;
  unfriend(targetUserId: string): Promise<void>;
  getConversation(id: string): Promise<ConversationDetailViewModel>;
  sendMessage(conversationId: string, text: string): Promise<ChatMessageViewModel>;
  reportOrBlockUser(request: ReportRequest): Promise<void>;
}

export function getSocialRepository(): ISocialRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewSocialRepository;
  }
  return apiSocialRepository;
}
