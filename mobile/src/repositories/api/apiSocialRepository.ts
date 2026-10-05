import { CommunityPostViewModel, CreatePostFormValues, FriendItemViewModel, PostCommentViewModel, ReportRequest, UserPublicProfileViewModel } from '@/features/community';
import { ConversationDetailViewModel, ConversationItemViewModel, ChatMessageViewModel } from '@/features/chat';
import type { ISocialRepository } from '../socialRepository';
import { apiClient, apiUploadFile } from '@/services/api/client';
import { authService } from '@/services/api/authService';
import { createUuid } from '@/utils/uuid';

interface FriendSummaryWire {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  friends_since: string;
}

interface FriendRequestWire {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
}

interface ChatMessageWire {
  id: string;
  conversation_id?: string | null;
  sender_user_id: string;
  sender: string;
  text: string;
  created_at: string;
  client_message_id?: string;
}

interface ConversationWire {
  conversation_id: string;
  peer: {
    user_id: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
  unread_count: number;
  last_message_at: string;
  last_message?: ChatMessageWire | null;
}

interface PublicProfileWire { id: string; full_name: string; avatar_url?: string | null; role: string; fitness_goal?: string | null; created_at: string }
interface RelationWire { relation: 'none' | 'outgoing_pending' | 'incoming_pending' | 'friends' | 'blocked_either'; request_id?: string | null }

interface PostWire {
  id: string;
  author_id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string | null;
  };
  content: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  image_storage_keys?: string[] | null;
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  is_knowledge: boolean;
  reactions_count: number;
  comments_count: number;
  saved_by_viewer?: boolean;
  reacted_by_viewer?: boolean;
  created_at: string;
  likes_count?: number;
  liked_by_viewer?: boolean;
}

interface CommentWire {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string | null;
  author: { id: string; display_name: string; avatar_url?: string | null };
  text: string;
  created_at: string;
}

function mapComment(wire: CommentWire, currentUserId?: string): PostCommentViewModel {
  return { id: wire.id, parentCommentId: wire.parent_comment_id || undefined, authorId: wire.author_id, authorName: wire.author.display_name, authorRole: 'member', text: wire.text, createdAt: new Date(wire.created_at).toLocaleString('vi-VN'), isOwner: currentUserId === wire.author_id, likesCount: wire.likes_count || 0, likedByViewer: Boolean(wire.liked_by_viewer) };
}

function mapPost(wire: PostWire): CommunityPostViewModel {
  const tags = wire.tags || [];
  const mealTagNames = new Set(['Dinh dưỡng sạch', 'Bữa phụ năng lượng', 'Giàu đạm (High Protein)', 'Keto / Low Carb']);
  const category = tags.includes('nutrition_qa')
    ? 'nutrition_qa'
    : tags.includes('workout_exp')
      ? 'workout_exp'
      : 'all';

  return {
    id: wire.id,
    authorId: wire.author_id,
    authorName: wire.author.display_name,
    authorRole: 'member',
    content: wire.content,
    mediaUrl: wire.image_urls?.[0] || wire.image_url || undefined,
    mediaUrls: wire.image_urls?.length ? wire.image_urls : wire.image_url ? [wire.image_url] : [],
    mediaStorageKeys: wire.image_storage_keys || [],
    category,
    visibility: wire.visibility,
    createdAt: new Date(wire.created_at).toLocaleString('vi-VN'),
    reactions: {
      love: wire.reactions_count,
      fire: 0,
      smile: 0,
      userReaction: wire.reacted_by_viewer ? 'love' : undefined,
    },
    commentCount: wire.comments_count,
    workoutTags: tags.filter((tag) => tag !== 'workout_exp' && tag !== 'nutrition_qa' && !mealTagNames.has(tag)),
    mealTags: tags.filter((tag) => mealTagNames.has(tag)),
    isKnowledgeSharing: wire.is_knowledge,
    savedByViewer: Boolean(wire.saved_by_viewer),
  };
}

export class ApiSocialRepository implements ISocialRepository {
  private convPeerCache = new Map<string, string>();

  async listPosts(scope: 'public' | 'friends' = 'public'): Promise<CommunityPostViewModel[]> {
    const [response, me] = await Promise.all([
      apiClient<{ items: PostWire[]; nextCursor?: string | null }>(`/social/posts?scope=${scope}&limit=50`, { method: 'GET' }),
      authService.getMe(),
    ]);
    return (response.items || []).map((wire) => ({ ...mapPost(wire), isOwner: wire.author_id === me.id }));
  }

  async listBookmarkedPosts(): Promise<CommunityPostViewModel[]> {
    const [response, me] = await Promise.all([
      apiClient<{ items: PostWire[]; nextCursor?: string | null }>('/social/bookmarks?limit=50', { method: 'GET' }),
      authService.getMe(),
    ]);
    return (response.items || []).map((wire) => ({ ...mapPost(wire), savedByViewer: true, isOwner: wire.author_id === me.id }));
  }

  async getPost(id: string): Promise<CommunityPostViewModel> {
    const [wire, comments, me] = await Promise.all([
      apiClient<PostWire>(`/social/posts/${encodeURIComponent(id)}`),
      apiClient<{ items: CommentWire[] }>(`/social/posts/${encodeURIComponent(id)}/comments?limit=50`),
      authService.getMe(),
    ]);
    return { ...mapPost(wire), isOwner: wire.author_id === me.id, comments: (comments.items || []).map((item) => mapComment(item, me.id)) };
  }

  async createPost(values: CreatePostFormValues): Promise<CommunityPostViewModel> {
    const mediaFiles = (values.mediaFiles?.length
      ? values.mediaFiles
      : (values.mediaUrls?.length ? values.mediaUrls : values.mediaUrl ? [values.mediaUrl] : []).map((uri) => ({ uri }))).slice(0, 5);
    const storageKeys: string[] = [];
    for (const image of mediaFiles) {
      const imageUri = image.uri;
      if (/^https?:\/\//i.test(imageUri)) continue;
      const lower = imageUri.toLowerCase();
      const mimeType = image.mimeType || (lower.includes('.png') ? 'image/png' : lower.includes('.webp') ? 'image/webp' : 'image/jpeg');
      const upload = await apiUploadFile<{ storage_key?: string; storageKey?: string }>(
        '/uploads', imageUri, mimeType, { category: 'posts' }
      );
      const storageKey = upload.storage_key || upload.storageKey;
      if (!storageKey) throw new Error('Máy chủ không trả về mã lưu trữ của hình ảnh.');
      storageKeys.push(storageKey);
    }
    const tags = [...values.workoutTags, ...values.mealTags];
    if (values.category !== 'all') tags.unshift(values.category);
    const result = await apiClient<PostWire>('/social/posts', { method: 'POST', body: JSON.stringify({ content: values.content, image_storage_keys: storageKeys, tags, visibility: 'public', is_knowledge: Boolean(values.isKnowledgeSharing) }) });
    return { ...mapPost(result), isOwner: true };
  }

  async updatePost(postId: string, values: CreatePostFormValues): Promise<CommunityPostViewModel> {
    const storageKeys: string[] = [];
    for (const image of (values.mediaFiles || []).slice(0, 5)) {
      if (image.storageKey) {
        storageKeys.push(image.storageKey);
        continue;
      }
      const lower = image.uri.toLowerCase();
      const mimeType = image.mimeType || (lower.includes('.png') ? 'image/png' : lower.includes('.webp') ? 'image/webp' : 'image/jpeg');
      const upload = await apiUploadFile<{ storage_key?: string; storageKey?: string }>('/uploads', image.uri, mimeType, { category: 'posts' });
      const storageKey = upload.storage_key || upload.storageKey;
      if (!storageKey) throw new Error('Máy chủ không trả về mã lưu trữ của hình ảnh.');
      storageKeys.push(storageKey);
    }
    const tags = [...values.workoutTags, ...values.mealTags];
    if (values.category !== 'all') tags.unshift(values.category);
    const result = await apiClient<PostWire>(`/social/posts/${encodeURIComponent(postId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: values.content, image_storage_keys: storageKeys, tags, is_knowledge: Boolean(values.isKnowledgeSharing) }),
    });
    return { ...mapPost(result), isOwner: true };
  }

  async addComment(postId: string, text: string, parentCommentId?: string): Promise<PostCommentViewModel> {
    const [result, me] = await Promise.all([
      apiClient<CommentWire>(`/social/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: JSON.stringify({ text, parent_comment_id: parentCommentId }) }),
      authService.getMe(),
    ]);
    return mapComment(result, me.id);
  }

  async updatePostVisibility(postId: string, visibility: CommunityPostViewModel['visibility']): Promise<CommunityPostViewModel> {
    const result = await apiClient<PostWire>(`/social/posts/${encodeURIComponent(postId)}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    });
    return { ...mapPost(result), isOwner: true };
  }

  toggleBookmark(postId: string): Promise<{ active: boolean; count: number }> {
    return apiClient(`/social/posts/${encodeURIComponent(postId)}/bookmark`, { method: 'POST' });
  }

  toggleCommentLike(commentId: string): Promise<{ active: boolean; count: number }> {
    return apiClient(`/social/comments/${encodeURIComponent(commentId)}/like`, { method: 'POST' });
  }

  async deletePost(postId: string): Promise<void> {
    await apiClient(`/social/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });
  }

  async blockUser(userId: string): Promise<void> {
    await apiClient('/social/blocks', { method: 'POST', body: JSON.stringify({ user_id: userId }) });
  }

  async getPublicProfile(userId: string): Promise<{ profile: UserPublicProfileViewModel; requestId?: string }> {
    const me = await authService.getMe();
    const wire = await apiClient<PublicProfileWire>(`/users/${encodeURIComponent(userId)}/profile`);
    const relation: RelationWire = me.id === userId ? { relation: 'none' } : await apiClient<RelationWire>(`/social/friends/status/${encodeURIComponent(userId)}`);
    const friendshipStatus = relation.relation === 'friends' ? 'friend' : relation.relation === 'outgoing_pending' ? 'request_sent' : relation.relation === 'incoming_pending' ? 'request_received' : 'none';
    return { profile: { id: wire.id, name: wire.full_name, role: wire.role === 'pt' ? 'pt' : 'member', bio: wire.fitness_goal || '', friendshipStatus, postCount: 0, friendCount: 0, posts: [], ptProfileId: wire.role === 'pt' ? wire.id : undefined }, requestId: relation.request_id || undefined };
  }

  async searchUsers(query: string): Promise<FriendItemViewModel[]> {
    if (!query.trim()) return [];
    const result = await apiClient<PublicProfileWire[]>(`/users/search?q=${encodeURIComponent(query.trim())}&limit=20`);
    return (result || []).map((item) => ({ id: item.id, name: item.full_name, role: item.role === 'pt' ? 'pt' : 'member', relationship: 'none', headline: item.fitness_goal || undefined }));
  }

  async listConversations(): Promise<ConversationItemViewModel[]> {
    const result = await apiClient<{ items: ConversationWire[] }>('/chat/friends/conversations?limit=50');
    return (result.items || []).map((item) => ({ id: item.conversation_id, participantId: item.peer.user_id, participantName: item.peer.display_name || 'Người dùng Fitmate', participantRole: 'member', participantAvatar: item.peer.avatar_url || undefined, isOnline: false, lastMessage: item.last_message?.text || 'Chưa có tin nhắn', lastMessageTime: new Date(item.last_message_at).toLocaleString('vi-VN'), unreadCount: item.unread_count }));
  }

  async reactToPost(postId: string, type: 'love' | 'fire' | 'smile'): Promise<{ active: boolean; count: number }> {
    const wireType = type === 'love' ? 'heart' : type === 'fire' ? 'flame' : 'smile';
    return apiClient(`/social/posts/${encodeURIComponent(postId)}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type: wireType }),
    });
  }

  async getFriends(): Promise<{
    friends: FriendItemViewModel[];
    pendingRequests: FriendItemViewModel[];
    sentRequests: FriendItemViewModel[];
    discoverUsers: FriendItemViewModel[];
  }> {
    const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
      apiClient<{ items: FriendSummaryWire[]; nextCursor?: string | null }>('/social/friends', {
        method: 'GET',
      }),
      apiClient<{ items: FriendRequestWire[] }>('/social/friends/requests?type=incoming', {
        method: 'GET',
      }),
      apiClient<{ items: FriendRequestWire[] }>('/social/friends/requests?type=outgoing', {
        method: 'GET',
      }),
    ]);

    const friends: FriendItemViewModel[] = (friendsRes?.items || []).map((f) => ({
      id: f.id,
      name: f.display_name,
      role: 'member',
      isOnline: false,
      relationship: 'friend',
      headline: f.avatar_url ? undefined : 'Bạn bè Fitmate',
    }));

    const pendingRequests: FriendItemViewModel[] = (incomingRes?.items || []).map((r) => ({
      id: r.sender_id,
      requestId: r.id,
      name: `Người dùng ${r.sender_id.slice(0, 8)}`,
      role: 'member',
      relationship: 'received_request',
      requestDate: new Date(r.created_at).toLocaleDateString('vi-VN'),
    }));

    const sentRequests: FriendItemViewModel[] = (outgoingRes?.items || []).map((r) => ({
      id: r.recipient_id,
      requestId: r.id,
      name: `Người dùng ${r.recipient_id.slice(0, 8)}`,
      role: 'member',
      relationship: 'sent_request',
      requestDate: new Date(r.created_at).toLocaleDateString('vi-VN'),
    }));

    return {
      friends,
      pendingRequests,
      sentRequests,
      discoverUsers: [],
    };
  }

  async sendFriendRequest(targetUserId: string): Promise<void> {
    await apiClient('/social/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: targetUserId }),
    });
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await apiClient(`/social/friends/requests/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'accept' }),
    });
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    await apiClient(`/social/friends/requests/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject' }),
    });
  }

  async cancelFriendRequest(requestId: string): Promise<void> {
    await apiClient(`/social/friends/requests/${requestId}`, { method: 'POST', body: JSON.stringify({ action: 'cancel' }) });
  }

  async unfriend(targetUserId: string): Promise<void> {
    await apiClient(`/social/friends/${targetUserId}`, {
      method: 'DELETE',
    });
  }

  async getConversation(id: string): Promise<ConversationDetailViewModel> {
    let conv: ConversationWire;
    try {
      conv = await apiClient<ConversationWire>(`/chat/friends/conversations/${id}`, { method: 'GET' });
    } catch {
      const list = await apiClient<{ items: ConversationWire[] }>('/chat/friends/conversations?limit=100');
      const existing = (list.items || []).find((item) => item.peer.user_id === id);
      if (existing) conv = existing;
      else {
        const profile = await apiClient<PublicProfileWire>(`/users/${encodeURIComponent(id)}/profile`);
        this.convPeerCache.set(id, id);
        return { id, participantId: id, participantName: profile.full_name, participantRole: profile.role === 'pt' ? 'pt' : 'member', isOnline: false, isRestricted: false, messages: [] };
      }
    }
    if (conv?.peer?.user_id) {
      this.convPeerCache.set(conv.conversation_id, conv.peer.user_id);
    }

    const messagesRes = await apiClient<{ items: ChatMessageWire[]; nextCursor?: string | null }>(
      `/chat/friends/conversations/${conv.conversation_id}/messages?limit=50`,
      { method: 'GET' }
    );

    const messages: ChatMessageViewModel[] = (messagesRes?.items || []).map((m) => {
      const isSelf = conv?.peer?.user_id ? m.sender_user_id !== conv.peer.user_id : true;
      return {
        id: m.id,
        senderId: m.sender_user_id,
        senderName: m.sender,
        text: m.text,
        timestamp: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        isSelf,
      };
    });

    return {
      id: conv.conversation_id,
      participantId: conv.peer.user_id,
      participantName: conv.peer.display_name || 'Người dùng Fitmate',
      participantRole: 'member',
      isOnline: false,
      isRestricted: false,
      messages,
    };
  }

  async sendMessage(conversationId: string, text: string): Promise<ChatMessageViewModel> {
    let peerUserId = this.convPeerCache.get(conversationId);
    if (!peerUserId) {
      try {
        const conv = await apiClient<ConversationWire>(`/chat/friends/conversations/${conversationId}`, {
          method: 'GET',
        });
        peerUserId = conv.peer.user_id;
        this.convPeerCache.set(conversationId, peerUserId);
      } catch {
        // Fallback: nếu conversationId chính là peerUserId
        peerUserId = conversationId;
      }
    }

    const clientMessageId = createUuid();
    const res = await apiClient<ChatMessageWire>('/chat/friends/messages', {
      method: 'POST',
      body: JSON.stringify({
        peer_user_id: peerUserId,
        text,
        client_message_id: clientMessageId,
      }),
    });

    return {
      id: res?.id || clientMessageId,
      senderId: res?.sender_user_id || 'me',
      senderName: res?.sender || 'Tôi',
      text: res?.text || text,
      timestamp: res?.created_at
        ? new Date(res.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : 'Vừa xong',
      status: 'sent',
      isSelf: true,
    };
  }

  async reportOrBlockUser(request: ReportRequest): Promise<void> {
    if (request.targetType === 'user' && request.detail.toLowerCase().includes('block')) {
      await apiClient('/social/blocks', {
        method: 'POST',
        body: JSON.stringify({ user_id: request.targetId }),
      });
      return;
    }

    await apiClient('/social/reports', {
      method: 'POST',
      body: JSON.stringify({
        target_type: request.targetType,
        target_id: request.targetId,
        reason: request.reason,
        details: request.detail || `Báo cáo từ ${request.targetAuthorName || 'người dùng'}`,
      }),
    });
  }
}

export const apiSocialRepository = new ApiSocialRepository();
