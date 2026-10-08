import { apiClient } from './client';
import {
  AppointmentWire,
  BookingHoldStatusResponseWire,
  BookingRescheduleResponseWire,
  CreateBookingHoldResponseWire,
  CreateRescheduleRequestBodyWire,
  ListAppointmentsResponse,
  PaymentWire,
  Review,
} from './types';

export const bookingService = {
  /**
   * List appointments of current authenticated member
   * Operation: listMyBookings
   * Endpoint: GET /me/bookings
   */
  async listMyBookings(params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ListAppointmentsResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));

    const qs = query.toString() ? '?' + query.toString() : '';
    return apiClient<ListAppointmentsResponse>('/me/bookings' + qs);
  },

  /**
   * List appointments assigned to current PT
   * Operation: listMyTrainerBookings
   * Endpoint: GET /me/trainer-bookings
   */
  async listMyTrainerBookings(params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ListAppointmentsResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));

    const qs = query.toString() ? '?' + query.toString() : '';
    return apiClient<ListAppointmentsResponse>('/me/trainer-bookings' + qs);
  },

  /**
   * Get single appointment detail (Member or PT)
   * Operation: getMyBookingDetail
   * Endpoint: GET /me/bookings/{id}
   */
  async getMyBookingDetail(id: string): Promise<AppointmentWire> {
    return apiClient<AppointmentWire>('/me/bookings/' + encodeURIComponent(id));
  },

  /**
   * Create temporary hold (TTL 10 minutes)
   * Operation: createBookingHold
   * Endpoint: POST /bookings/holds
   */
  async createBookingHold(data: {
    pt_id: string;
    service_id: string;
    slot_start_utc: string;
  }): Promise<CreateBookingHoldResponseWire> {
    return apiClient<CreateBookingHoldResponseWire>('/bookings/holds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Check hold status and TTL before payment
   * Operation: getBookingHold
   * Endpoint: GET /bookings/holds/{id}
   */
  async getBookingHold(id: string): Promise<BookingHoldStatusResponseWire> {
    return apiClient<BookingHoldStatusResponseWire>(
      '/bookings/holds/' + encodeURIComponent(id)
    );
  },

  /**
   * Create payment intent for an active hold
   * Operation: createPayment
   * Endpoint: POST /payments
   */
  async createPayment(data: {
    hold_id: string;
    method: 'payos' | 'vnpay';
  }): Promise<PaymentWire> {
    return apiClient<PaymentWire>('/payments', {
      method: 'POST',
      headers: { 'Idempotency-Key': data.hold_id },
      body: JSON.stringify(data),
    });
  },

  async getMyPayment(id: string): Promise<PaymentWire> {
    return apiClient<PaymentWire>('/me/payments/' + encodeURIComponent(id));
  },

  /**
   * PT confirms/accepts booking
   * Operation: confirmMyBooking
   * Endpoint: POST /me/bookings/{id}/confirm
   */
  async confirmMyBooking(id: string): Promise<AppointmentWire> {
    return apiClient<AppointmentWire>(
      '/me/bookings/' + encodeURIComponent(id) + '/confirm',
      { method: 'POST' }
    );
  },

  /**
   * PT starts session (Confirmed -> InProgress)
   * Operation: startMyBooking
   * Endpoint: POST /me/bookings/{id}/start
   */
  async startMyBooking(id: string): Promise<AppointmentWire> {
    return apiClient<AppointmentWire>(
      '/me/bookings/' + encodeURIComponent(id) + '/start',
      { method: 'POST' }
    );
  },

  /**
   * PT completes session (InProgress -> Completed)
   * Operation: completeMyBooking
   * Endpoint: POST /me/bookings/{id}/complete
   */
  async completeMyBooking(id: string): Promise<AppointmentWire> {
    return apiClient<AppointmentWire>(
      '/me/bookings/' + encodeURIComponent(id) + '/complete',
      { method: 'POST' }
    );
  },

  async confirmCompletion(id: string): Promise<AppointmentWire> {
    return apiClient<AppointmentWire>(
      '/me/bookings/' + encodeURIComponent(id) + '/confirm-completion',
      { method: 'POST' }
    );
  },

  async disputeCompletion(id: string, reason: string): Promise<AppointmentWire> {
    return apiClient<AppointmentWire>(
      '/me/bookings/' + encodeURIComponent(id) + '/dispute',
      { method: 'POST', body: JSON.stringify({ reason }) }
    );
  },

  /**
   * Cancel booking with mandatory reason
   * Operation: cancelMyBooking
   * Endpoint: POST /me/bookings/{id}/cancel
   */
  async cancelMyBooking(id: string, reason: string): Promise<AppointmentWire> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Vui lòng nhập lý do hủy đặt lịch ít nhất 5 ký tự');
    }
    return apiClient<AppointmentWire>(
      '/me/bookings/' + encodeURIComponent(id) + '/cancel',
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  /**
   * Propose rescheduling to a new slot
   * Operation: createRescheduleRequest
   * Endpoint: POST /bookings/{id}/reschedule-requests
   */
  async createRescheduleRequest(
    id: string,
    data: CreateRescheduleRequestBodyWire
  ): Promise<BookingRescheduleResponseWire> {
    return apiClient<BookingRescheduleResponseWire>(
      '/bookings/' + encodeURIComponent(id) + '/reschedule-requests',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Accept reschedule request
   * Operation: acceptRescheduleRequest
   * Endpoint: POST /bookings/reschedule-requests/{requestId}/accept
   */
  async acceptRescheduleRequest(
    requestId: string
  ): Promise<BookingRescheduleResponseWire> {
    return apiClient<BookingRescheduleResponseWire>(
      '/bookings/reschedule-requests/' + encodeURIComponent(requestId) + '/accept',
      { method: 'POST' }
    );
  },

  /**
   * Reject reschedule request
   * Operation: rejectRescheduleRequest
   * Endpoint: POST /bookings/reschedule-requests/{requestId}/reject
   */
  async rejectRescheduleRequest(
    requestId: string,
    rejection_reason?: string
  ): Promise<BookingRescheduleResponseWire> {
    return apiClient<BookingRescheduleResponseWire>(
      '/bookings/reschedule-requests/' + encodeURIComponent(requestId) + '/reject',
      {
        method: 'POST',
        body: JSON.stringify({ rejection_reason }),
      }
    );
  },

  /**
   * Cancel reschedule request
   * Operation: cancelRescheduleRequest
   * Endpoint: POST /bookings/reschedule-requests/{requestId}/cancel
   */
  async cancelRescheduleRequest(
    requestId: string
  ): Promise<BookingRescheduleResponseWire> {
    return apiClient<BookingRescheduleResponseWire>(
      '/bookings/reschedule-requests/' + encodeURIComponent(requestId) + '/cancel',
      { method: 'POST' }
    );
  },

  /**
   * Submit review for coach
   * Operation: submitTrainerReview
   * Endpoint: POST /trainers/{id}/reviews
   */
  async submitTrainerReview(
    ptId: string,
    data: { rating: number; text: string }
  ): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Số sao đánh giá phải từ 1 đến 5');
    }
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Vui lòng nhập nhận xét của bạn');
    }
    return apiClient<Review>(
      '/trainers/' + encodeURIComponent(ptId) + '/reviews',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};
