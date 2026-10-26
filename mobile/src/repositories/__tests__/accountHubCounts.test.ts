import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/api/authService', () => ({ authService: { getMe: vi.fn() } }));
vi.mock('@/services/api/bookingService', () => ({ bookingService: { listMyBookings: vi.fn(), listMyTrainerBookings: vi.fn() } }));
vi.mock('@/services/api/client', () => ({ apiClient: vi.fn(), apiUploadFile: vi.fn(), resolveApiResourceUrl: vi.fn(), ApiError: class extends Error {} }));
import { ApiAccountRepository } from '../api/apiAccountRepository';
import { authService } from '@/services/api/authService';
import { bookingService } from '@/services/api/bookingService';

describe('account hub totals', () => {
  beforeEach(() => vi.clearAllMocks());
  it('uses server totals even when there are more than 100 appointments', async () => {
    vi.mocked(authService.getMe).mockResolvedValue({ id: 'member', role: 'member', full_name: 'Test', email: 'test@example.test' } as never);
    vi.mocked(bookingService.listMyBookings).mockResolvedValue({ total: 125, items: [], page: 1, pageSize: 1 });
    const hub = await new ApiAccountRepository().getAccountHub();
    expect(hub.upcomingBookingCount).toBe(500);
    expect(hub.summaryUnavailable).toBe(false);
    expect(bookingService.listMyBookings).toHaveBeenCalledTimes(4);
    expect(bookingService.listMyTrainerBookings).not.toHaveBeenCalled();
  });
  it('uses trainer endpoints and exposes unavailable on any failed count', async () => {
    vi.mocked(authService.getMe).mockResolvedValue({ id: 'trainer', role: 'pt' } as never);
    vi.mocked(bookingService.listMyTrainerBookings).mockRejectedValue(new Error('unavailable'));
    const hub = await new ApiAccountRepository().getAccountHub();
    expect(hub.upcomingBookingCount).toBeUndefined();
    expect(hub.summaryUnavailable).toBe(true);
    expect(bookingService.listMyBookings).not.toHaveBeenCalled();
  });
});
