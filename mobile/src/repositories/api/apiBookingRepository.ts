import {
  BookingAppointmentViewModel,
  BookingStatus,
  CoachSummaryViewModel,
  PaymentStatus,
  RefundTrackingViewModel,
} from '@/features/booking/bookingTypes';
import { IBookingRepository } from '../bookingRepository';
import { bookingService } from '@/services/api/bookingService';
import { AppointmentWire, mapPTPublicDetailToDetail } from '@/services/api/types';
import { trainersService } from '@/services/api/trainersService';

export function mapAppointmentWireToViewModel(
  wire: AppointmentWire,
  coachSummary?: CoachSummaryViewModel
): BookingAppointmentViewModel {
  const slotDate = new Date(wire.slot_start_utc);
  const formattedDate = isNaN(slotDate.getTime())
    ? wire.slot_start_utc
    : slotDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  const startTimeStr = isNaN(slotDate.getTime())
    ? ''
    : slotDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

  const durationMin = wire.duration_minutes || 60;
  const endDate = new Date(slotDate.getTime() + durationMin * 60000);
  const endTimeStr = isNaN(endDate.getTime())
    ? ''
    : endDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

  let bookingStatus: BookingStatus = 'confirmed';
  switch (wire.status) {
    case 'Held':
    case 'Pending':
      bookingStatus = 'hold_pending_payment';
      break;
    case 'Confirmed':
      bookingStatus = 'confirmed';
      break;
    case 'InProgress':
      bookingStatus = 'in_progress';
      break;
    case 'AwaitingMemberConfirmation':
      bookingStatus = 'awaiting_member_confirmation';
      break;
    case 'Completed':
      bookingStatus = 'completed';
      break;
    case 'Cancelled':
    case 'Expired':
      bookingStatus = 'cancelled';
      break;
    case 'Disputed':
      bookingStatus = 'disputed';
      break;
    case 'NoShow':
      bookingStatus = 'no_show';
      break;
    default:
      bookingStatus = 'confirmed';
  }

  let paymentStatus: PaymentStatus = 'unpaid';
  if (wire.status === 'Cancelled') {
    paymentStatus = wire.actual_paid_vnd > 0 ? 'refund_pending' : 'unpaid';
  } else if (wire.actual_paid_vnd > 0) {
    paymentStatus = 'paid';
  } else if (wire.status === 'Held') {
    paymentStatus = 'unpaid';
  }

  return {
    id: wire.id,
    bookingCode: `BK-${wire.id.slice(0, 8).toUpperCase()}`,
    coach: coachSummary || {
      id: wire.pt_user_id,
      name: 'Huấn luyện viên',
      title: 'Pro PT',
      specialty: 'Thể hình & Sức mạnh',
      rating: 5.0,
      reviewCount: 0,
      isVerified: true,
    },
    serviceName: 'Buổi tập cá nhân 1-1',
    scheduledDate: formattedDate,
    scheduledTime: `${startTimeStr} - ${endTimeStr} (${durationMin} phút)`,
    location: 'Fitmate Partner Gym',
    bookingStatus,
    paymentStatus,
    paidAmountVnd: wire.actual_paid_vnd,
    createdAt: wire.slot_start_utc,
    canCancel:
      (wire.status === 'Confirmed' || wire.status === 'Pending') &&
      slotDate.getTime() - Date.now() >= 24 * 60 * 60 * 1000,
    canReschedule: wire.status === 'Confirmed' && wire.rescheduled_count < 1,
    canReview: wire.status === 'Completed',
    canConfirmCompletion: wire.status === 'AwaitingMemberConfirmation',
    canDispute: wire.status === 'AwaitingMemberConfirmation',
    memberConfirmationDeadlineUtc: wire.member_confirmation_deadline_utc ?? undefined,
  };
}

export class ApiBookingRepository implements IBookingRepository {
  private coachCache = new Map<string, CoachSummaryViewModel>();

  private async getCoachSummary(ptId: string): Promise<CoachSummaryViewModel> {
    if (this.coachCache.has(ptId)) {
      return this.coachCache.get(ptId)!;
    }
    try {
      const raw = await trainersService.getTrainer(ptId);
      const detail = mapPTPublicDetailToDetail(raw);
      const summary: CoachSummaryViewModel = {
        id: detail.id,
        name: detail.name,
        title: 'Pro PT',
        specialty: detail.specialties.join(', ') || 'Thể hình',
        rating: detail.rating,
        reviewCount: detail.reviewCount,
        avatarUrl: detail.avatarUrl ?? undefined,
        isVerified: detail.isVerified,
      };
      this.coachCache.set(ptId, summary);
      return summary;
    } catch {
      const fallback: CoachSummaryViewModel = {
        id: ptId,
        name: 'Huấn luyện viên',
        title: 'Pro PT',
        specialty: 'Thể hình & Phục hồi',
        rating: 5.0,
        reviewCount: 0,
        isVerified: true,
      };
      return fallback;
    }
  }

  async listMyAppointments(filter?: { status?: string }): Promise<BookingAppointmentViewModel[]> {
    const response = await bookingService.listMyBookings(filter);
    const results: BookingAppointmentViewModel[] = [];

    for (const wire of response.items || []) {
      const coach = await this.getCoachSummary(wire.pt_user_id);
      results.push(mapAppointmentWireToViewModel(wire, coach));
    }

    return results;
  }

  async getAppointmentDetail(id: string): Promise<BookingAppointmentViewModel> {
    const wire = await bookingService.getMyBookingDetail(id);
    const coach = await this.getCoachSummary(wire.pt_user_id);
    return mapAppointmentWireToViewModel(wire, coach);
  }

  async cancelAppointment(id: string, reason: string): Promise<BookingAppointmentViewModel> {
    const wire = await bookingService.cancelMyBooking(id, reason);
    const coach = await this.getCoachSummary(wire.pt_user_id);
    return mapAppointmentWireToViewModel(wire, coach);
  }

  async confirmCompletion(id: string): Promise<BookingAppointmentViewModel> {
    const wire = await bookingService.confirmCompletion(id);
    const coach = await this.getCoachSummary(wire.pt_user_id);
    return mapAppointmentWireToViewModel(wire, coach);
  }

  async disputeCompletion(id: string, reason: string): Promise<BookingAppointmentViewModel> {
    const wire = await bookingService.disputeCompletion(id, reason);
    const coach = await this.getCoachSummary(wire.pt_user_id);
    return mapAppointmentWireToViewModel(wire, coach);
  }

  async rescheduleAppointment(
    id: string,
    newSlotStartUtc: string,
    reason: string
  ): Promise<void> {
    await bookingService.createRescheduleRequest(id, {
      new_slot_start_utc: newSlotStartUtc,
      reason,
    });
  }

  async createHold(params: {
    ptId: string;
    serviceId: string;
    slotStartUtc: string;
  }): Promise<{
    holdId: string;
    expiresAtUtc: string;
    appointmentId: string;
  }> {
    const res = await bookingService.createBookingHold({
      pt_id: params.ptId,
      service_id: params.serviceId,
      slot_start_utc: params.slotStartUtc,
    });
    return {
      holdId: res.hold_id,
      expiresAtUtc: res.hold_expires_at,
      appointmentId: res.appointment_id,
    };
  }

  async getHoldStatus(
    holdId: string
  ): Promise<{ holdId: string; expiresAt: string; isActive: boolean }> {
    const res = await bookingService.getBookingHold(holdId);
    return {
      holdId: res.hold_id,
      expiresAt: res.expires_at,
      isActive: res.is_active,
    };
  }

  async submitReview(ptId: string, rating: number, feedbackText: string): Promise<void> {
    await bookingService.submitTrainerReview(ptId, {
      rating,
      text: feedbackText,
    });
  }

  async getRefundTracking(bookingId: string): Promise<RefundTrackingViewModel> {
    const wire = await bookingService.getMyBookingDetail(bookingId);
    return {
      bookingId: wire.id,
      bookingCode: `BK-${wire.id.slice(0, 8).toUpperCase()}`,
      refundStatus: wire.status === 'Cancelled' ? 'processing' : 'pending',
      requestedAmountVnd: wire.actual_paid_vnd,
      refundAmountVnd: wire.actual_paid_vnd,
      requestedAt: wire.cancelled_at_utc || new Date().toISOString(),
      reason: 'Hủy lịch hẹn trước giờ tập theo chính sách hoàn tiền 100%.',
      cancellationPolicyNotice:
        'Hoàn trả 100% khi hội viên hủy trước ít nhất 24 giờ theo chính sách nền tảng Fitmate.',
    };
  }
}

export const apiBookingRepository = new ApiBookingRepository();
