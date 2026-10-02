import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getAccountRepository } from '../accountRepository';
import { apiAccountRepository } from '../api/apiAccountRepository';
import { previewAccountRepository } from '../preview/previewAccountRepository';
import { authService } from '@/services/api/authService';
import { ApiError } from '@/services/api/client';

describe('Account Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('defaults to apiAccountRepository when EXPO_PUBLIC_DATA_SOURCE is not set', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getAccountRepository();
    expect(repo).toBe(apiAccountRepository);
  });

  it('uses previewAccountRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getAccountRepository();
    expect(repo).toBe(previewAccountRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'unknown_mock';
    expect(() => getAccountRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed and does NOT fallback to preview repository on API 500 error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    vi.spyOn(authService, 'getMe').mockRejectedValue(
      new ApiError('Internal Server Error', 500)
    );
    const previewSpy = vi.spyOn(previewAccountRepository, 'getAccountHub');

    await expect(apiAccountRepository.getAccountHub()).rejects.toThrow(
      'Internal Server Error'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('fails closed and does NOT fallback to preview repository on network timeout', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    vi.spyOn(authService, 'getMe').mockRejectedValue(
      new Error('Network request failed')
    );
    const previewSpy = vi.spyOn(previewAccountRepository, 'getAccountHub');

    await expect(apiAccountRepository.getAccountHub()).rejects.toThrow(
      'Network request failed'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('handles account deletion lifecycle via API', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me/delete-request')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            user_id: 'user-123',
            status: 'pending_deletion',
            is_pending_deletion: true,
            retention_days_remaining: 30,
            has_active_bookings: false,
            requested_at: '2026-10-02T10:00:00Z',
          }),
        };
      }
      if (url.includes('/users/me/deletion-status')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            user_id: 'user-123',
            status: 'pending_deletion',
            is_pending_deletion: true,
            retention_days_remaining: 30,
            has_active_bookings: false,
          }),
        };
      }
      if (url.includes('/users/me/cancel-deletion')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            user_id: 'user-123',
            status: 'active',
            is_pending_deletion: false,
            retention_days_remaining: 0,
            has_active_bookings: false,
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    const requested = await apiAccountRepository.requestAccountDeletion('Không có nhu cầu tiếp tục sử dụng');
    expect(requested.isPendingDeletion).toBe(true);
    expect(requested.retentionDaysRemaining).toBe(30);

    const status = await apiAccountRepository.getDeletionStatus();
    expect(status.status).toBe('pending_deletion');

    const cancelled = await apiAccountRepository.cancelAccountDeletion();
    expect(cancelled.isPendingDeletion).toBe(false);
    expect(cancelled.status).toBe('active');
  });

  it('handles account deletion and export in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getAccountRepository();

    const deletion = await repo.requestAccountDeletion();
    expect(deletion.isPendingDeletion).toBe(true);
    expect(deletion.retentionDaysRemaining).toBe(30);

    const exportData = await repo.exportUserData();
    expect(exportData.downloadUrl).toBeDefined();

    const cancelled = await repo.cancelAccountDeletion();
    expect(cancelled.isPendingDeletion).toBe(false);
  });
});
