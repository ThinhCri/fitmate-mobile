import { CommunityPostViewModel, CreatePostFormValues, FriendItemViewModel, PostCommentViewModel, ReportRequest, UserPublicProfileViewModel } from '@/features/community';
import { ConversationDetailViewModel, ConversationItemViewModel, ChatImageInput, ChatMessageViewModel } from '@/features/chat';
import { apiSocialRepository } from './api/apiSocialRepository';

export interface ISocialRepository {
  listPosts(scope?: 'public' | 'friends', query?: string): Promise<CommunityPostViewModel[]>;
  listBookmarkedPosts(): Promise<CommunityPostViewModel[]>;
  getPost(id: string): Promise<CommunityPostViewModel>;
  createPost(values: CreatePostFormValues): Promise<CommunityPostViewModel>;
  updatePost(postId: string, values: CreatePostFormValues): Promise<CommunityPostViewModel>;
  addComment(postId: string, text: string, parentCommentId?: string): Promise<PostCommentViewModel>;
  updatePostVisibility(postId: string, visibility: CommunityPostViewModel['visibility']): Promise<CommunityPostViewModel>;
  toggleBookmark(postId: string): Promise<{ active: boolean; count: number }>;
  toggleCommentLike(commentId: string): Promise<{ active: boolean; count: number }>;
  deletePost(postId: string): Promise<void>;
  blockUser(userId: string): Promise<void>;
  getPublicProfile(userId: string): Promise<{ profile: UserPublicProfileViewModel; requestId?: string }>;
  listProfilePosts(userId: string, cursor?: string): Promise<{ items: CommunityPostViewModel[]; nextCursor: string | null }>;
  searchUsers(query: string): Promise<FriendItemViewModel[]>;
  listConversations(): Promise<ConversationItemViewModel[]>;
  reactToPost(postId: string, type: 'love' | 'fire' | 'smile'): Promise<{ active: boolean; count: number }>;
  getFriends(): Promise<{
    friends: FriendItemViewModel[];
    pendingRequests: FriendItemViewModel[];
    sentRequests: FriendItemViewModel[];
    discoverUsers: FriendItemViewModel[];
  }>;
  sendFriendRequest(targetUserId: string): Promise<void>;
  acceptFriendRequest(requestId: string): Promise<void>;
  rejectFriendRequest(requestId: string): Promise<void>;
  cancelFriendRequest(requestId: string): Promise<void>;
  unfriend(targetUserId: string): Promise<void>;
  getConversation(id: string): Promise<ConversationDetailViewModel>;
  markConversationRead(conversationId: string, lastReadMessageId: string): Promise<void>;
  sendMessage(conversationId: string, text: string, images?: ChatImageInput[]): Promise<ChatMessageViewModel>;
  toggleMessageReaction(messageId: string, reaction: '❤️' | '👍' | '😂' | '😮' | '😢'): Promise<ChatMessageViewModel['reactions']>;
  reportOrBlockUser(request: ReportRequest): Promise<void>;
}

export function getSocialRepository(): ISocialRepository {
  return apiSocialRepository;
}
