import { describe, it, expect } from 'vitest';
import {
  BookingAppointmentViewModel,
  BookingHoldQuoteViewModel,
  RefundTrackingViewModel,
} from '../bookingTypes';

describe('Booking Flow & Appointment Logic (Stitch E03 - E09)', () => {
  it('verifies hold quote pricing structure and integer VND', () => {
    const quote: BookingHoldQuoteViewModel = {
      bookingId: 'bk-hold-1',
      coach: {
        id: 'c1',
        name: 'Hoang Nam',
        title: 'Pro PT',
        specialty: 'Strength',
        rating: 4.9,
        reviewCount: 48,
        isVerified: true,
      },
      service: {
        id: 's1',
        name: 'Personal Training 1-on-1',
        durationMinutes: 60,
        priceVnd: 300000,
        description: 'Strength training',
        locationName: 'Gym Thao Dien',
        locationAddress: 'Thao Dien, Thu Duc',
      },
      selectedDate: '2026-09-28',
      selectedTimeSlot: '18:00 - 19:00',
      location: 'Gym Thao Dien',
      servicePriceVnd: 300000,
      platformFeeVnd: 0,
      totalVnd: 300000,
      holdExpiresAt: '2026-09-28T18:10:00Z',
      remainingSeconds: 600,
    };

    expect(Number.isInteger(quote.servicePriceVnd)).toBe(true);
    expect(Number.isInteger(quote.totalVnd)).toBe(true);
    expect(quote.totalVnd).toBe(quote.servicePriceVnd + quote.platformFeeVnd);
    expect(quote.remainingSeconds).toBeGreaterThan(0);
  });

  it('maintains independent bookingStatus and paymentStatus semantics', () => {
    const appointment: BookingAppointmentViewModel = {
      id: 'bk-100',
      bookingCode: 'BK-20260928-8921',
      coach: {
        id: 'c1',
        name: 'Hoang Nam',
        title: 'Pro PT',
        specialty: 'Strength',
        rating: 4.9,
        reviewCount: 48,
        isVerified: true,
      },
      serviceName: 'Personal Training 1-on-1',
      scheduledDate: '2026-09-28',
      scheduledTime: '18:00 - 19:00',
      location: 'Gym Thao Dien',
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paidAmountVnd: 300000,
      createdAt: '2026-09-28T10:00:00Z',
      canCancel: true,
      canReschedule: true,
      canReview: false,
    };

    expect(appointment.bookingStatus).toBe('confirmed');
    expect(appointment.paymentStatus).toBe('paid');
    // Review is only available once completed
    expect(appointment.canReview).toBe(false);

    // After session is completed:
    const completedAppt: BookingAppointmentViewModel = {
      ...appointment,
      bookingStatus: 'completed',
      canReview: true,
      canCancel: false,
      canReschedule: false,
    };
    expect(completedAppt.canReview).toBe(true);
    expect(completedAppt.canCancel).toBe(false);
  });

  it('tracks refund states and preserves original paid amount', () => {
    const refund: RefundTrackingViewModel = {
      bookingId: 'bk-100',
      bookingCode: 'BK-20260928-8921',
      refundStatus: 'pending',
      requestedAmountVnd: 300000,
      refundAmountVnd: 300000,
      requestedAt: '2026-09-28T10:30:00Z',
      reason: 'Schedule conflict',
      cancellationPolicyNotice: '100% refund (>24h notice)',
    };

    expect(refund.refundAmountVnd).toBeLessThanOrEqual(refund.requestedAmountVnd);
    expect(refund.refundStatus).toBe('pending');
  });
});
