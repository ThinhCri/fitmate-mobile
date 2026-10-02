import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getBookingRepository } from '../bookingRepository';
import { apiBookingRepository } from '../api/apiBookingRepository';
import { previewBookingRepository } from '../preview/previewBookingRepository';
import { bookingService } from '@/services/api/bookingService';
import { ApiError } from '@/services/api/client';

describe('Booking Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    vi.restoreAllMocks();
  });

  it('defaults to apiBookingRepository in production mode', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getBookingRepository();
    expect(repo).toBe(apiBookingRepository);
  });

  it('uses previewBookingRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getBookingRepository();
    expect(repo).toBe(previewBookingRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'invalid_source';
    expect(() => getBookingRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed and does NOT fallback to preview repository on API 500 error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    vi.spyOn(bookingService, 'listMyBookings').mockRejectedValue(
      new ApiError('Internal Server Error', 500)
    );
    const previewSpy = vi.spyOn(previewBookingRepository, 'listMyAppointments');

    await expect(apiBookingRepository.listMyAppointments()).rejects.toThrow(
      'Internal Server Error'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('fails closed and does NOT fallback to preview repository on network error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    vi.spyOn(bookingService, 'getMyBookingDetail').mockRejectedValue(
      new Error('Network error')
    );
    const previewSpy = vi.spyOn(previewBookingRepository, 'getAppointmentDetail');

    await expect(apiBookingRepository.getAppointmentDetail('bk-123')).rejects.toThrow(
      'Network error'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('provides isolated preview data in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getBookingRepository();
    const list = await repo.listMyAppointments();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].bookingCode).toContain('BK-');
  });
});
