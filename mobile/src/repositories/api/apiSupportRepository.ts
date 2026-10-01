import {
  NotificationItemViewModel,
  SupportTicketSummaryViewModel,
  SupportTicketDetailViewModel,
  SupportMessageViewModel,
  CreateTicketFormValues,
} from '@/features/support/supportTypes';
import type { ISupportRepository } from '../supportRepository';
import { ApiError } from '@/services/api/client';

export class ApiSupportRepository implements ISupportRepository {
  async getNotifications(): Promise<NotificationItemViewModel[]> {
    throw new ApiError('Notifications API endpoint not available', 501);
  }

  async markNotificationRead(_id: string): Promise<void> {
    throw new ApiError('Mark notification read API endpoint not available', 501);
  }

  async markAllNotificationsRead(): Promise<void> {
    throw new ApiError('Mark all notifications read API endpoint not available', 501);
  }

  async getTickets(): Promise<SupportTicketSummaryViewModel[]> {
    throw new ApiError('Support tickets API endpoint not available', 501);
  }

  async getTicketDetail(id: string): Promise<SupportTicketDetailViewModel> {
    throw new ApiError(`Support ticket detail API endpoint for ${id} not available`, 501);
  }

  async createTicket(_values: CreateTicketFormValues): Promise<SupportTicketDetailViewModel> {
    throw new ApiError('Create support ticket API endpoint not available', 501);
  }

  async replyTicket(_ticketId: string, _message: string): Promise<SupportMessageViewModel> {
    throw new ApiError('Reply support ticket API endpoint not available', 501);
  }
}

export const apiSupportRepository = new ApiSupportRepository();
