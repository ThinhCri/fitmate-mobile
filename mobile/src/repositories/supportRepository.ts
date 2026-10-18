import {
  NotificationItemViewModel,
  SupportTicketSummaryViewModel,
  SupportTicketDetailViewModel,
  SupportMessageViewModel,
  CreateTicketFormValues,
} from '@/features/support/supportTypes';
import { apiSupportRepository } from './api/apiSupportRepository';

export interface ISupportRepository {
  getNotifications(): Promise<NotificationItemViewModel[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  getTickets(): Promise<SupportTicketSummaryViewModel[]>;
  getTicketDetail(id: string): Promise<SupportTicketDetailViewModel>;
  createTicket(values: CreateTicketFormValues): Promise<SupportTicketDetailViewModel>;
  replyTicket(ticketId: string, message: string): Promise<SupportMessageViewModel>;
}

export function getSupportRepository(): ISupportRepository {
  return apiSupportRepository;
}
