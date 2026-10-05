import {
  NotificationItemViewModel,
  SupportTicketSummaryViewModel,
  SupportTicketDetailViewModel,
  SupportMessageViewModel,
  CreateTicketFormValues,
} from '@/features/support/supportTypes';
import type { ISupportRepository } from '../supportRepository';
import { apiClient } from '@/services/api/client';

interface NotificationWire {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  summary?: string | null;
  payload?: any;
  read?: boolean;
  created_at?: string;
}

interface SupportTicketSummaryWire {
  id: string;
  subject: string;
  category: string;
  priority?: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface SupportTicketMessageWire {
  id: string;
  sender_id: string;
  is_admin: boolean;
  content: string;
  attachment_urls?: string[] | null;
  created_at: string;
}

interface SupportTicketDetailWire {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: SupportTicketMessageWire[];
}

export class ApiSupportRepository implements ISupportRepository {
  async getNotifications(): Promise<NotificationItemViewModel[]> {
    const res = await apiClient<{ items: NotificationWire[]; total: number }>(
      '/me/notifications?pageSize=50',
      { method: 'GET' }
    );

    return (res?.items || []).map((n) => {
      let category: 'booking' | 'social' | 'ai' | 'system' = 'system';
      let targetType: 'booking' | 'friend_request' | 'ai_plan' | 'expired' = 'expired';
      const normalizedType = (n.type || '').replace(/_/g, '').toLowerCase();

      if (normalizedType === 'booking' || normalizedType === 'payment') {
        category = 'booking';
        targetType = 'booking';
      } else if (normalizedType === 'friendrequest') {
        category = 'social';
        targetType = 'friend_request';
      } else if (normalizedType === 'reminder') {
        category = 'ai';
        targetType = 'ai_plan';
      }

      return {
        id: n.id,
        title: n.title || 'Thông báo',
        body: n.message || n.summary || '',
        timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
        category,
        isRead: Boolean(n.read),
        targetType,
        targetId: n.payload?.booking_id || n.payload?.requestId,
      };
    });
  }

  async markNotificationRead(id: string): Promise<void> {
    await apiClient(`/me/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    // Graceful: Lấy danh sách notifications chưa đọc và đánh dấu
    try {
      const unread = await this.getNotifications();
      const unreadItems = unread.filter((n) => !n.isRead);
      await Promise.all(unreadItems.map((n) => this.markNotificationRead(n.id)));
    } catch {
      // Idempotent
    }
  }

  async getTickets(): Promise<SupportTicketSummaryViewModel[]> {
    const res = await apiClient<{ items: SupportTicketSummaryWire[]; total: number }>(
      '/support/tickets?pageSize=50',
      { method: 'GET' }
    );

    return (res?.items || []).map((t) => ({
      id: t.id,
      ticketCode: `#TK-${t.id.slice(0, 6).toUpperCase()}`,
      subject: t.subject,
      category: t.category === 'booking_dispute' ? 'booking_dispute' : 'app_bug',
      categoryLabel: t.category === 'booking_dispute' ? 'Tranh chấp lịch hẹn' : 'Hỗ trợ kỹ thuật',
      status: t.status === 'resolved' || t.status === 'closed' ? 'resolved' : 'open',
      statusLabel: t.status === 'resolved' || t.status === 'closed' ? 'Đã giải quyết' : 'Chờ phản hồi',
      lastUpdatedAt: new Date(t.updated_at || t.created_at).toLocaleDateString('vi-VN'),
      createdAt: new Date(t.created_at).toLocaleDateString('vi-VN'),
    }));
  }

  async getTicketDetail(id: string): Promise<SupportTicketDetailViewModel> {
    const t = await apiClient<SupportTicketDetailWire>(`/support/tickets/${id}`, {
      method: 'GET',
    });

    return {
      id: t.id,
      ticketCode: `#TK-${t.id.slice(0, 6).toUpperCase()}`,
      subject: t.subject,
      category: t.category === 'booking_dispute' ? 'booking_dispute' : 'app_bug',
      categoryLabel: t.category === 'booking_dispute' ? 'Tranh chấp lịch hẹn' : 'Hỗ trợ kỹ thuật',
      status: t.status === 'resolved' || t.status === 'closed' ? 'resolved' : 'open',
      statusLabel: t.status === 'resolved' || t.status === 'closed' ? 'Đã giải quyết' : 'Chờ phản hồi',
      createdAt: new Date(t.created_at).toLocaleDateString('vi-VN'),
      messages: (t.messages || []).map((m) => ({
        id: m.id,
        sender: m.is_admin ? 'support' : 'user',
        senderName: m.is_admin ? 'Bộ phận CSKH Fitmate' : 'Bạn',
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })),
    };
  }

  async createTicket(values: CreateTicketFormValues): Promise<SupportTicketDetailViewModel> {
    const res = await apiClient<SupportTicketDetailWire>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({
        subject: values.subject,
        category: values.category,
        message: values.message,
      }),
    });

    return {
      id: res.id,
      ticketCode: `#TK-${res.id.slice(0, 6).toUpperCase()}`,
      subject: res.subject,
      category: res.category === 'booking_dispute' ? 'booking_dispute' : 'app_bug',
      categoryLabel: res.category === 'booking_dispute' ? 'Tranh chấp lịch hẹn' : 'Hỗ trợ kỹ thuật',
      status: 'open',
      statusLabel: 'Chờ phản hồi',
      createdAt: new Date(res.created_at).toLocaleDateString('vi-VN'),
      messages: (res.messages || []).map((m) => ({
        id: m.id,
        sender: m.is_admin ? 'support' : 'user',
        senderName: m.is_admin ? 'Bộ phận CSKH Fitmate' : 'Bạn',
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })),
    };
  }

  async replyTicket(ticketId: string, message: string): Promise<SupportMessageViewModel> {
    const res = await apiClient<SupportTicketDetailWire>(`/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    const lastMsg = res?.messages?.[res.messages.length - 1];
    return {
      id: lastMsg?.id || `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Bạn',
      text: message,
      timestamp: lastMsg?.created_at
        ? new Date(lastMsg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : 'Vừa xong',
    };
  }
}

export const apiSupportRepository = new ApiSupportRepository();
