/**
 * Support & Notifications Types and View Models (Stitch H01 - H04)
 */

export interface NotificationItemViewModel {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: 'booking' | 'social' | 'ai' | 'system';
  isRead: boolean;
  targetType: 'booking' | 'friend_request' | 'ai_plan' | 'expired';
  targetId?: string;
  authorName?: string;
}

export type TicketCategory =
  | 'booking_dispute'
  | 'app_bug'
  | 'pt_complaint'
  | 'billing'
  | 'other';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicketSummaryViewModel {
  id: string;
  ticketCode: string;
  subject: string;
  category: TicketCategory;
  categoryLabel: string;
  status: TicketStatus;
  statusLabel: string;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface SupportMessageViewModel {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicketDetailViewModel {
  id: string;
  ticketCode: string;
  subject: string;
  category: TicketCategory;
  categoryLabel: string;
  status: TicketStatus;
  statusLabel: string;
  createdAt: string;
  linkedBookingId?: string;
  bookingResolution?: 'SessionDelivered' | 'MemberNoShow' | 'PtNoShow';
  bookingResolutionReason?: string;
  messages: SupportMessageViewModel[];
}

export interface CreateTicketFormValues {
  category: TicketCategory;
  subject: string;
  message: string;
  linkedBookingId?: string;
}
