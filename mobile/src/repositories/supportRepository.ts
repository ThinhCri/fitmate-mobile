import {
  NotificationItemViewModel,
  SupportTicketSummaryViewModel,
  SupportTicketDetailViewModel,
  SupportMessageViewModel,
  CreateTicketFormValues,
} from '@/features/support/supportTypes';
import { getDataSourceMode } from './repositoryTypes';
import { apiSupportRepository } from './api/apiSupportRepository';
import { previewSupportRepository } from './preview/previewSupportRepository';

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
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewSupportRepository;
  }
  return apiSupportRepository;
}
