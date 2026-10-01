import {
  NotificationItemViewModel,
  SupportTicketSummaryViewModel,
  SupportTicketDetailViewModel,
  SupportMessageViewModel,
  CreateTicketFormValues,
} from '@/features/support/supportTypes';
import type { ISupportRepository } from '../supportRepository';

let previewNotifications: NotificationItemViewModel[] = [
  {
    id: 'notif-1',
    title: 'Xác nhận lịch tập cùng PT',
    body: 'HLV Hoàng Nam đã xác nhận lịch tập 18:00 hôm nay. Vui lòng có mặt trước 10 phút tại phòng tập.',
    timestamp: '10 phút trước',
    category: 'booking',
    isRead: false,
    targetType: 'booking',
    targetId: 'book-101',
  },
  {
    id: 'notif-2',
    title: 'Lời mời kết bạn mới',
    body: 'Đặng Thu Trang vừa gửi lời mời kết bạn kết nối tập luyện cùng bạn.',
    timestamp: '45 phút trước',
    category: 'social',
    isRead: false,
    targetType: 'friend_request',
  },
  {
    id: 'notif-3',
    title: 'Gợi ý từ Trợ lý Fitmate AI',
    body: 'Trợ lý Fitmate AI đã chuẩn bị đề xuất tối ưu hóa bài tập Upper Body A dựa trên buổi trước.',
    timestamp: '3 giờ trước',
    category: 'ai',
    isRead: true,
    targetType: 'ai_plan',
  },
  {
    id: 'notif-4',
    title: 'Khảo sát chất lượng dịch vụ',
    body: 'Sự kiện tập luyện chung tháng trước đã kết thúc và lưu trữ.',
    timestamp: '2 ngày trước',
    category: 'system',
    isRead: true,
    targetType: 'expired',
  },
];

let previewTickets: SupportTicketSummaryViewModel[] = [
  {
    id: 'tk-1',
    ticketCode: '#TK-8291',
    subject: 'Yêu cầu đối soát hoàn tiền lịch hẹn ngày 28/09 do PT có việc đột xuất',
    category: 'booking_dispute',
    categoryLabel: 'Tranh chấp lịch hẹn',
    status: 'open',
    statusLabel: 'Chờ phản hồi',
    lastUpdatedAt: 'Hôm nay 10:20',
    createdAt: '28/09/2026',
  },
  {
    id: 'tk-2',
    ticketCode: '#TK-7840',
    subject: 'Lỗi đồng bộ dữ liệu nhật ký calo sau khi quét ảnh camera',
    category: 'app_bug',
    categoryLabel: 'Lỗi kỹ thuật',
    status: 'resolved',
    statusLabel: 'Đã giải quyết',
    lastUpdatedAt: '24/09/2026',
    createdAt: '23/09/2026',
  },
];

export class PreviewSupportRepository implements ISupportRepository {
  async getNotifications(): Promise<NotificationItemViewModel[]> {
    return [...previewNotifications];
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = previewNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    previewNotifications.forEach((n) => {
      n.isRead = true;
    });
  }

  async getTickets(): Promise<SupportTicketSummaryViewModel[]> {
    return [...previewTickets];
  }

  async getTicketDetail(id: string): Promise<SupportTicketDetailViewModel> {
    const summary = previewTickets.find((t) => t.id === id) || previewTickets[0];
    return {
      id: summary.id,
      ticketCode: summary.ticketCode,
      subject: summary.subject,
      category: summary.category,
      categoryLabel: summary.categoryLabel,
      status: summary.status,
      statusLabel: summary.statusLabel,
      createdAt: summary.createdAt,
      messages: [
        {
          id: 'msg-1',
          sender: 'user',
          senderName: 'Bạn',
          text: summary.subject,
          timestamp: summary.createdAt,
        },
        {
          id: 'msg-2',
          sender: 'support',
          senderName: 'Bộ phận CSKH Fitmate',
          text: 'Fitmate đã tiếp nhận thông tin và đang xử lý theo quy định nền tảng.',
          timestamp: summary.lastUpdatedAt,
        },
      ],
    };
  }

  async createTicket(values: CreateTicketFormValues): Promise<SupportTicketDetailViewModel> {
    const newId = `tk-${Date.now()}`;
    const code = `#TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const summary: SupportTicketSummaryViewModel = {
      id: newId,
      ticketCode: code,
      subject: values.subject,
      category: values.category,
      categoryLabel: values.category === 'booking_dispute' ? 'Tranh chấp lịch hẹn' : 'Hỗ trợ kỹ thuật',
      status: 'open',
      statusLabel: 'Chờ phản hồi',
      lastUpdatedAt: 'Vừa xong',
      createdAt: 'Hôm nay',
    };
    previewTickets = [summary, ...previewTickets];
    return this.getTicketDetail(newId);
  }

  async replyTicket(_ticketId: string, message: string): Promise<SupportMessageViewModel> {
    return {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Bạn',
      text: message,
      timestamp: 'Vừa xong',
    };
  }
}

export const previewSupportRepository = new PreviewSupportRepository();
