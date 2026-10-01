import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
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
});
