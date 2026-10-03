import {
  BookingAppointmentViewModel,
  RefundTrackingViewModel,
} from '@/features/booking/bookingTypes';
import { getDataSourceMode } from './repositoryTypes';
import { apiBookingRepository } from './api/apiBookingRepository';
import { previewBookingRepository } from './preview/previewBookingRepository';

export interface IBookingRepository {
  listMyAppointments(filter?: { status?: string }): Promise<BookingAppointmentViewModel[]>;
  getAppointmentDetail(id: string): Promise<BookingAppointmentViewModel>;
  cancelAppointment(id: string, reason: string): Promise<BookingAppointmentViewModel>;
  confirmCompletion(id: string): Promise<BookingAppointmentViewModel>;
  disputeCompletion(id: string, reason: string): Promise<BookingAppointmentViewModel>;
  rescheduleAppointment(id: string, newSlotStartUtc: string, reason: string): Promise<void>;
  createHold(params: {
    ptId: string;
    serviceId: string;
    slotStartUtc: string;
  }): Promise<{
    holdId: string;
    expiresAtUtc: string;
    appointmentId: string;
  }>;
  getHoldStatus(holdId: string): Promise<{
    holdId: string;
    expiresAt: string;
    isActive: boolean;
  }>;
  submitReview(ptId: string, rating: number, feedbackText: string): Promise<void>;
  getRefundTracking(bookingId: string): Promise<RefundTrackingViewModel>;
}

export function getBookingRepository(): IBookingRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewBookingRepository;
  }
  return apiBookingRepository;
}
