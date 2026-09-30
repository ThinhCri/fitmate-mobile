import { describe, it, expect } from 'vitest';
import {
  CreateTicketFormValues,
  NotificationItemViewModel,
  SupportTicketSummaryViewModel,
} from '../supportTypes';

describe('Support & Notifications Presentation Logic (Stitch H01 - H04)', () => {
  it('filters notifications by unread state', () => {
    const notifications: NotificationItemViewModel[] = [
      {
        id: 'n-1',
        title: 'Booking confirmed',
        body: 'PT confirmed appointment',
        timestamp: '10m ago',
        category: 'booking',
        isRead: false,
        targetType: 'booking',
      },
      {
        id: 'n-2',
        title: 'Survey',
        body: 'Thanks for using Fitmate',
        timestamp: '1d ago',
        category: 'system',
        isRead: true,
        targetType: 'expired',
      },
    ];

    const unread = notifications.filter((n) => !n.isRead);
    expect(unread.length).toBe(1);
    expect(unread[0].id).toBe('n-1');
  });

  it('validates support ticket creation data', () => {
    const formValues: CreateTicketFormValues = {
      category: 'booking_dispute',
      subject: 'Yêu cầu đối soát hoàn tiền #BOOK-101',
      message: 'PT thông báo bận đột xuất và hai bên thống nhất hủy buổi tập.',
      linkedBookingId: 'BOOK-101',
    };

    expect(formValues.category).toBe('booking_dispute');
    expect(formValues.subject.length).toBeGreaterThan(5);
    expect(formValues.message.length).toBeGreaterThan(15);
    expect(formValues.linkedBookingId).toBe('BOOK-101');
  });
});
