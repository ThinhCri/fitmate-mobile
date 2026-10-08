/**
 * Booking & PT Appointment View Models & Types (Stitch E01 - E09)
 */

export interface BookingServiceViewModel {
  id: string;
  name: string;
  durationMinutes: number;
  priceVnd: number;
  description: string;
  locationName: string;
  locationAddress: string;
  serviceKind?: 'one_to_one' | 'assessment_and_plan';
  targetAudience?: string;
  requiredEquipment?: string;
  deliverable?: string;
}

export interface BookingSlotViewModel {
  id: string;
  durationMinutes?: number;
  dateString?: string;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "09:00"
  period: 'morning' | 'afternoon' | 'evening';
  isAvailable: boolean;
}

export interface CoachSummaryViewModel {
  id: string;
  name: string;
  title: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface BookingHoldQuoteViewModel {
  bookingId: string;
  slotStartUtc?: string;
  coach: CoachSummaryViewModel;
  service: BookingServiceViewModel;
  selectedDate: string; // e.g. "Thứ Hai, 28/09/2026"
  selectedTimeSlot: string; // e.g. "18:00 - 19:00"
  location: string;
  servicePriceVnd: number;
  platformFeeVnd: number;
  totalVnd: number;
  holdExpiresAt: string; // ISO string
  remainingSeconds: number;
}

export type BookingStatus =
  | 'hold_pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'awaiting_member_confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'no_show';

export type PaymentStatus =
  | 'unpaid'
  | 'verifying'
  | 'paid'
  | 'refund_pending'
  | 'refunded'
  | 'failed';

export interface BookingAppointmentViewModel {
  id: string;
  bookingCode: string; // e.g. "BK-20260928-8921"
  coach: CoachSummaryViewModel;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paidAmountVnd: number;
  createdAt: string;
  canCancel: boolean;
  canReschedule: boolean;
  canReview: boolean;
  canConfirmCompletion: boolean;
  canDispute: boolean;
  memberConfirmationDeadlineUtc?: string;
  notes?: string;
}

export interface RefundTrackingViewModel {
  bookingId: string;
  bookingCode: string;
  refundStatus: 'pending' | 'processing' | 'succeeded' | 'failed';
  requestedAmountVnd: number;
  refundAmountVnd: number;
  requestedAt: string;
  completedAt?: string;
  reason: string;
  cancellationPolicyNotice: string;
}

export interface PtReviewSubmissionViewModel {
  bookingId: string;
  coachName: string;
  serviceName: string;
  rating: number; // 1 - 5
  feedbackText: string;
  isSubmitting?: boolean;
}
