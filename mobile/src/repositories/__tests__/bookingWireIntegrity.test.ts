import { describe, expect, it, vi } from 'vitest';
vi.mock('@/services/api/client', () => ({ apiClient: vi.fn(), ApiError: class extends Error {} }));
import { mapAppointmentWireToViewModel } from '../api/apiBookingRepository';
import type { AppointmentWire } from '@/services/api/types';
const appointment = {
  id: 'booking-uuid', pt_user_id: 'trainer-uuid', service_id: 'service-uuid', status: 'Confirmed',
  duration_minutes: 60, slot_start_utc: '2027-01-01T00:00:00Z', actual_paid_vnd: 100000, rescheduled_count: 0,
} as AppointmentWire;
describe('booking wire integrity', () => {
  it('preserves a confirmed booking and shows missing coach statistics as unavailable', () => {
    const view = mapAppointmentWireToViewModel(appointment);
    expect(view.bookingStatus).toBe('confirmed'); expect(view.coach.rating).toBeNull(); expect(view.coach.reviewCount).toBeNull();
  });
  it('rejects an unknown state instead of falsely confirming the booking', () => {
    expect(() => mapAppointmentWireToViewModel({ ...appointment, status: 'Unknown' } as AppointmentWire)).toThrow();
  });
  it('rejects a missing duration instead of inventing an hour-long session', () => {
    expect(() => mapAppointmentWireToViewModel({ ...appointment, duration_minutes: 0 })).toThrow();
  });
});
