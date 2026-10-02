import { FriendItemViewModel, ReportRequest } from '@/features/community';
import { ConversationDetailViewModel, ChatMessageViewModel } from '@/features/chat';
import type { ISocialRepository } from '../socialRepository';
import { apiClient } from '@/services/api/client';

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

export class ApiSocialRepository implements ISocialRepository {
  private convPeerCache = new Map<string, string>();

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
      id: r.id,
      name: `Người dùng ${r.sender_id.slice(0, 8)}`,
      role: 'member',
      relationship: 'received_request',
      requestDate: new Date(r.created_at).toLocaleDateString('vi-VN'),
    }));

    const sentRequests: FriendItemViewModel[] = (outgoingRes?.items || []).map((r) => ({
      id: r.id,
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

  async unfriend(targetUserId: string): Promise<void> {
    await apiClient(`/social/friends/${targetUserId}`, {
      method: 'DELETE',
    });
  }

  async getConversation(id: string): Promise<ConversationDetailViewModel> {
    const conv = await apiClient<ConversationWire>(`/chat/friends/conversations/${id}`, {
      method: 'GET',
    });
    if (conv?.peer?.user_id) {
      this.convPeerCache.set(conv.conversation_id, conv.peer.user_id);
    }

    const messagesRes = await apiClient<{ items: ChatMessageWire[]; nextCursor?: string | null }>(
      `/chat/friends/conversations/${id}/messages?limit=50`,
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

    const clientMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
