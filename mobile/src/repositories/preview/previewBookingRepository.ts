import {
  BookingAppointmentViewModel,
  RefundTrackingViewModel,
} from '@/features/booking/bookingTypes';
import { IBookingRepository } from '../bookingRepository';

const PREVIEW_APPOINTMENTS: BookingAppointmentViewModel[] = [
  {
    id: 'bk-1',
    bookingCode: 'BK-20260928-8921',
    coach: {
      id: 'coach-1',
      name: 'HLV Hoàng Nam',
      title: 'Pro PT',
      specialty: 'Thể hình & Sức mạnh',
      rating: 4.9,
      reviewCount: 48,
      isVerified: true,
    },
    serviceName: 'Tập sức mạnh cá nhân 1-kèm-1',
    scheduledDate: 'Thứ Hai, 28/09/2026',
    scheduledTime: '18:00 - 19:00 (60 phút)',
    location: 'Fitmate Gym Thảo Điền',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    paidAmountVnd: 300000,
    createdAt: '2026-09-28T10:00:00Z',
    canCancel: true,
    canReschedule: true,
    canReview: false,
    canConfirmCompletion: false,
    canDispute: false,
  },
  {
    id: 'bk-2',
    bookingCode: 'BK-20260920-1120',
    coach: {
      id: 'coach-2',
      name: 'HLV Minh Trang',
      title: 'Senior Yoga PT',
      specialty: 'Yoga phục hồi & Căng cơ',
      rating: 5.0,
      reviewCount: 65,
      isVerified: true,
    },
    serviceName: 'Yoga trị liệu cá nhân 1-1',
    scheduledDate: '20/09/2026',
    scheduledTime: '07:30 - 08:30 (60 phút)',
    location: 'Fitmate Studio Quận 3',
    bookingStatus: 'completed',
    paymentStatus: 'paid',
    paidAmountVnd: 350000,
    createdAt: '2026-09-18T14:00:00Z',
    canCancel: false,
    canReschedule: false,
    canReview: true,
    canConfirmCompletion: false,
    canDispute: false,
  },
];

export class PreviewBookingRepository implements IBookingRepository {
  private appointments = [...PREVIEW_APPOINTMENTS];

  async listMyAppointments(): Promise<BookingAppointmentViewModel[]> {
    return [...this.appointments];
  }

  async getAppointmentDetail(id: string): Promise<BookingAppointmentViewModel> {
    const item = this.appointments.find((a) => a.id === id);
    if (!item) {
      return {
        ...this.appointments[0],
        id,
      };
    }
    return item;
  }

  async cancelAppointment(id: string, _reason: string): Promise<BookingAppointmentViewModel> {
    const item = await this.getAppointmentDetail(id);
    const updated: BookingAppointmentViewModel = {
      ...item,
      bookingStatus: 'cancelled',
      paymentStatus: 'refund_pending',
      canCancel: false,
      canReschedule: false,
    };
    this.appointments = this.appointments.map((a) => (a.id === id ? updated : a));
    return updated;
  }

  async confirmCompletion(id: string): Promise<BookingAppointmentViewModel> {
    const item = await this.getAppointmentDetail(id);
    const updated = { ...item, bookingStatus: 'completed' as const, canConfirmCompletion: false, canDispute: false, canReview: true };
    this.appointments = this.appointments.map((a) => (a.id === id ? updated : a));
    return updated;
  }

  async disputeCompletion(id: string, _reason: string): Promise<BookingAppointmentViewModel> {
    const item = await this.getAppointmentDetail(id);
    const updated = { ...item, bookingStatus: 'disputed' as const, canConfirmCompletion: false, canDispute: false };
    this.appointments = this.appointments.map((a) => (a.id === id ? updated : a));
    return updated;
  }

  async rescheduleAppointment(_id: string, _newSlotStartUtc: string, _reason: string): Promise<void> {
    // preview no-op
  }

  async createHold(_params: {
    ptId: string;
    serviceId: string;
    slotStartUtc: string;
  }): Promise<{
    holdId: string;
    expiresAtUtc: string;
    appointmentId: string;
  }> {
    return {
      holdId: 'preview-hold-1',
      expiresAtUtc: new Date(Date.now() + 600000).toISOString(),
      appointmentId: 'preview-apt-1',
    };
  }

  async getHoldStatus(
    holdId: string
  ): Promise<{ holdId: string; expiresAt: string; isActive: boolean }> {
    return {
      holdId,
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      isActive: true,
    };
  }

  async submitReview(_ptId: string, _rating: number, _feedbackText: string): Promise<void> {
    // preview no-op
  }

  async getRefundTracking(bookingId: string): Promise<RefundTrackingViewModel> {
    return {
      bookingId,
      bookingCode: 'BK-20260928-8921',
      refundStatus: 'processing',
      requestedAmountVnd: 300000,
      refundAmountVnd: 300000,
      requestedAt: '2026-09-28T14:30:00Z',
      reason: 'Hủy lịch hẹn trước 24 giờ theo chính sách hoàn tiền 100%.',
      cancellationPolicyNotice:
        'Hoàn trả 100% khi hủy trước ít nhất 24 giờ theo chính sách Fitmate.',
    };
  }
}

export const previewBookingRepository = new PreviewBookingRepository();
