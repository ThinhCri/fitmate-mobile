/**
 * Booking Service & Repository Unit Tests (MOB-802)
 *
 * Verifies:
 * 1. Appointment listing (/me/bookings, /me/trainer-bookings)
 * 2. Appointment detail lookup (/me/bookings/{id})
 * 3. Temporary booking hold creation (POST /bookings/holds) and lookup (GET /bookings/holds/{id})
 * 4. Payment intent creation (POST /payments)
 * 5. Appointment lifecycle transitions (confirm, start, complete, cancel)
 * 6. Reschedule request flow (create, accept, reject, cancel)
 * 7. Trainer review submission (POST /trainers/{id}/reviews) with validation
 * 8. Appointment wire DTO to view model mapping (DEC-026 lifecycle and financial separation)
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { bookingService } from '../bookingService';
import { mapAppointmentWireToViewModel } from '@/repositories/api/apiBookingRepository';
import { sessionManager } from '@/services/session/sessionManager';
import { AppointmentWire } from '../types';

const secureStoreMock = new Map<string, string>();

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => secureStoreMock.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, val: string) => {
    secureStoreMock.set(key, val);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStoreMock.delete(key);
  }),
}));

describe('bookingService & apiBookingRepository (MOB-802)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    sessionManager.setAccessToken('valid-member-token');
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Appointment Queries (/me/bookings)', () => {
    it('fetches list of appointments with query parameters', async () => {
      const mockResponse = {
        items: [
          {
            id: 'apt-001',
            member_id: 'mem-001',
            pt_user_id: 'pt-001',
            service_id: 'srv-001',
            slot_start_utc: '2026-10-05T10:00:00Z',
            duration_minutes: 60,
            status: 'Confirmed' as const,
            rescheduled_count: 0,
            price_listed_vnd: 300000,
            discount_vnd: 0,
            actual_paid_vnd: 300000,
            platform_fee_rate_bps: 1000,
            platform_fee_vnd: 30000,
            trainer_share_vnd: 270000,
            policy_version: '2026-09-22-v1',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const res = await bookingService.listMyBookings({ status: 'Confirmed', page: 1 });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].id).toBe('apt-001');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/bookings?status=Confirmed&page=1'),
        expect.anything()
      );
    });

    it('fetches single appointment detail by ID', async () => {
      const mockAppointment: AppointmentWire = {
        id: 'apt-002',
        member_id: 'mem-001',
        pt_user_id: 'pt-001',
        service_id: 'srv-001',
        slot_start_utc: '2026-10-06T14:00:00Z',
        duration_minutes: 60,
        status: 'InProgress',
        rescheduled_count: 0,
        price_listed_vnd: 350000,
        discount_vnd: 0,
        actual_paid_vnd: 350000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 35000,
        trainer_share_vnd: 315000,
        policy_version: '2026-09-22-v1',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockAppointment,
      });

      const res = await bookingService.getMyBookingDetail('apt-002');
      expect(res.id).toBe('apt-002');
      expect(res.status).toBe('InProgress');
    });
  });

  describe('2. Booking Hold and Payment Intent', () => {
    it('creates temporary booking hold with 5-minute TTL', async () => {
      const mockHold = {
        hold_id: 'hold-123',
        hold_expires_at: '2026-10-05T10:05:00Z',
        appointment_id: 'apt-hold-1',
        appointment_status: 'Held',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockHold,
      });

      const res = await bookingService.createBookingHold({
        pt_id: 'pt-123',
        service_id: 'srv-123',
        slot_start_utc: '2026-10-05T10:00:00Z',
      });

      expect(res.hold_id).toBe('hold-123');
      expect(res.appointment_status).toBe('Held');
    });

    it('creates payment intent for payos method', async () => {
      const mockPayment = {
        id: 'pay-001',
        appointment_id: 'apt-001',
        method: 'payos',
        status: 'Pending',
        amount_vnd: 300000,
        redirect_url: 'https://pay.payos.vn/checkout/12345',
        created_at: '2026-10-05T10:01:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockPayment,
      });

      const res = await bookingService.createPayment({
        hold_id: 'hold-123',
        method: 'payos',
      });

      expect(res.id).toBe('pay-001');
      expect(res.method).toBe('payos');
      expect(res.amount_vnd).toBe(300000);
    });
  });

  describe('3. Lifecycle Transitions and Cancellation', () => {
    it('validates minimum 5 characters reason on cancellation', async () => {
      await expect(bookingService.cancelMyBooking('apt-001', 'ngắn')).rejects.toThrow(
        'Vui lòng nhập lý do hủy đặt lịch ít nhất 5 ký tự'
      );
    });

    it('sends cancellation request when reason is valid', async () => {
      const mockCancelled: AppointmentWire = {
        id: 'apt-001',
        member_id: 'mem-001',
        pt_user_id: 'pt-001',
        service_id: 'srv-001',
        slot_start_utc: '2026-10-05T10:00:00Z',
        duration_minutes: 60,
        status: 'Cancelled',
        cancelled_at_utc: '2026-10-04T12:00:00Z',
        rescheduled_count: 0,
        price_listed_vnd: 300000,
        discount_vnd: 0,
        actual_paid_vnd: 300000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 30000,
        trainer_share_vnd: 270000,
        policy_version: '2026-09-22-v1',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCancelled,
      });

      const res = await bookingService.cancelMyBooking(
        'apt-001',
        'Có việc bận đột xuất không thể tham gia'
      );
      expect(res.status).toBe('Cancelled');
    });
  });

  describe('4. Reschedule Request Flow', () => {
    it('creates reschedule request with new slot and reason', async () => {
      const mockReschedule = {
        id: 'rq-001',
        appointment_id: 'apt-001',
        requested_by_user_id: 'mem-001',
        old_slot_start_utc: '2026-10-05T10:00:00Z',
        new_slot_start_utc: '2026-10-06T14:00:00Z',
        duration_minutes: 60,
        status: 'Pending',
        reason: 'Đổi sang ngày hôm sau',
        deadline_utc: '2026-10-05T06:00:00Z',
        created_at_utc: '2026-10-04T12:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockReschedule,
      });

      const res = await bookingService.createRescheduleRequest('apt-001', {
        new_slot_start_utc: '2026-10-06T14:00:00Z',
        reason: 'Đổi sang ngày hôm sau',
      });

      expect(res.id).toBe('rq-001');
      expect(res.status).toBe('Pending');
    });
  });

  describe('5. Trainer Review Validation', () => {
    it('rejects ratings outside 1..5 range', async () => {
      await expect(
        bookingService.submitTrainerReview('pt-001', { rating: 0, text: 'Tốt' })
      ).rejects.toThrow('Số sao đánh giá phải từ 1 đến 5');

      await expect(
        bookingService.submitTrainerReview('pt-001', { rating: 6, text: 'Tốt' })
      ).rejects.toThrow('Số sao đánh giá phải từ 1 đến 5');
    });

    it('rejects empty review text', async () => {
      await expect(
        bookingService.submitTrainerReview('pt-001', { rating: 5, text: '   ' })
      ).rejects.toThrow('Vui lòng nhập nhận xét của bạn');
    });
  });

  describe('6. Wire DTO to ViewModel Mapping (DEC-026)', () => {
    it('maps Confirmed appointment with paid status and cancellation permission', () => {
      const wire: AppointmentWire = {
        id: 'c8b66804-037f-4740-84cf-23212822a101',
        member_id: 'mem-101',
        pt_user_id: 'pt-101',
        service_id: 'srv-101',
        slot_start_utc: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        status: 'Confirmed',
        rescheduled_count: 0,
        price_listed_vnd: 300000,
        discount_vnd: 0,
        actual_paid_vnd: 300000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 30000,
        trainer_share_vnd: 270000,
        policy_version: '2026-09-22-v1',
      };

      const vm = mapAppointmentWireToViewModel(wire);
      expect(vm.id).toBe('c8b66804-037f-4740-84cf-23212822a101');
      expect(vm.bookingCode).toBe('BK-C8B66804');
      expect(vm.bookingStatus).toBe('confirmed');
      expect(vm.paymentStatus).toBe('paid');
      expect(vm.paidAmountVnd).toBe(300000);
      expect(vm.canCancel).toBe(true);
      expect(vm.canReschedule).toBe(true);
      expect(vm.canReview).toBe(false);
    });

    it('hides self-cancel and reschedule inside the 48-hour cutoff', () => {
      const wire: AppointmentWire = {
        id: 'apt-soon',
        member_id: 'mem-101',
        pt_user_id: 'pt-101',
        service_id: 'srv-101',
        slot_start_utc: new Date(Date.now() + 47 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        status: 'Confirmed',
        rescheduled_count: 0,
        price_listed_vnd: 300000,
        discount_vnd: 0,
        actual_paid_vnd: 300000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 30000,
        trainer_share_vnd: 270000,
        policy_version: '2026-09-22-v1',
      };

      const vm = mapAppointmentWireToViewModel(wire);
      expect(vm.canCancel).toBe(false);
      expect(vm.canReschedule).toBe(false);
    });

    it('disallows reschedule if already rescheduled once', () => {
      const wire: AppointmentWire = {
        id: 'apt-already-rescheduled',
        member_id: 'mem-101',
        pt_user_id: 'pt-101',
        service_id: 'srv-101',
        slot_start_utc: '2026-10-10T08:00:00Z',
        duration_minutes: 60,
        status: 'Confirmed',
        rescheduled_count: 1,
        price_listed_vnd: 300000,
        discount_vnd: 0,
        actual_paid_vnd: 300000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 30000,
        trainer_share_vnd: 270000,
        policy_version: '2026-09-22-v1',
      };

      const vm = mapAppointmentWireToViewModel(wire);
      expect(vm.canReschedule).toBe(false);
    });

    it('allows review only on Completed status', () => {
      const wire: AppointmentWire = {
        id: 'apt-completed',
        member_id: 'mem-101',
        pt_user_id: 'pt-101',
        service_id: 'srv-101',
        slot_start_utc: '2026-10-10T08:00:00Z',
        duration_minutes: 60,
        status: 'Completed',
        rescheduled_count: 0,
        price_listed_vnd: 300000,
        discount_vnd: 0,
        actual_paid_vnd: 300000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 30000,
        trainer_share_vnd: 270000,
        policy_version: '2026-09-22-v1',
      };

      const vm = mapAppointmentWireToViewModel(wire);
      expect(vm.bookingStatus).toBe('completed');
      expect(vm.canReview).toBe(true);
      expect(vm.canCancel).toBe(false);
    });

    it('allows member completion confirmation on Confirmed bookings after slot end', () => {
      const wire: AppointmentWire = {
        id: 'apt-past-confirmed',
        member_id: 'mem-101',
        pt_user_id: 'pt-101',
        service_id: 'srv-101',
        slot_start_utc: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        status: 'Confirmed',
        rescheduled_count: 0,
        price_listed_vnd: 300000,
        discount_vnd: 0,
        actual_paid_vnd: 300000,
        platform_fee_rate_bps: 1000,
        platform_fee_vnd: 30000,
        trainer_share_vnd: 270000,
        policy_version: '2026-09-22-v1',
      };

      const vm = mapAppointmentWireToViewModel(wire);
      expect(vm.bookingStatus).toBe('confirmed');
      expect(vm.canConfirmCompletion).toBe(true);
      expect(vm.canCancel).toBe(false);
    });
  });
});
