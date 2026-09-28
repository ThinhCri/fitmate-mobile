/**
 * AuthService and ApiClient Integration Tests (MOB-800)
 *
 * Verifies:
 * 1. Password policy enforcement (12-128 characters).
 * 2. PT registration verification guarantee (starts unverified, never auto-verified).
 * 3. Exclusion of mock fallbacks on API errors.
 * 4. Automatic 401 token refresh and single retry in apiClient.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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

import { authService } from '../authService';
import { apiClient, ApiError } from '../client';
import { sessionManager } from '@/services/session/sessionManager';
import { mapToDomainUser } from '@/services/session/userMapper';
import type { UserSummary } from '../types';

describe('AuthService & ApiClient (MOB-800)', () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    await sessionManager.clearSession();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Password Policy (12-128 chars)', () => {
    it('rejects registration password shorter than 12 characters', async () => {
      await expect(
        authService.register({
          email: 'short@fitmate.vn',
          password: 'Pass1', // 5 chars
          full_name: 'Nguyen Van A',
          role: 'member',
        })
      ).rejects.toThrow('Mật khẩu phải có độ dài từ 12 đến 128 ký tự');
    });

    it('rejects registration password longer than 128 characters', async () => {
      const longPass = 'A'.repeat(129);
      await expect(
        authService.register({
          email: 'long@fitmate.vn',
          password: longPass,
          full_name: 'Nguyen Van A',
          role: 'member',
        })
      ).rejects.toThrow('Mật khẩu phải có độ dài từ 12 đến 128 ký tự');
    });

    it('rejects password reset with new_password shorter than 12 characters', async () => {
      await expect(
        authService.resetPassword({
          token: 'valid-reset-token',
          new_password: 'short',
        })
      ).rejects.toThrow('Mật khẩu mới phải có độ dài từ 12 đến 128 ký tự');
    });

    it('rejects password reset with new_password longer than 128 characters', async () => {
      await expect(
        authService.resetPassword({
          token: 'valid-reset-token',
          new_password: 'B'.repeat(130),
        })
      ).rejects.toThrow('Mật khẩu mới phải có độ dài từ 12 đến 128 ký tự');
    });
  });

  describe('2. PT Verification Guarantee', () => {
    it('ensures PT registration maps to unverified status and never auto-verified', () => {
      const ptSummary: UserSummary = {
        id: 'pt-uuid-001',
        email: 'trainer@fitmate.vn',
        full_name: 'Tran Van PT',
        role: 'pt',
      };

      const domainPt = mapToDomainUser(ptSummary);

      expect(domainPt.profile.isPt).toBe(true);
      expect(domainPt.profile.isVerified).toBe(false);
      expect(domainPt.profile.certificateStatus).toBe('pending');
      // Password must not be persisted in domain user
      expect(domainPt.password).toBe('');
    });

    it('ensures member registration maps to member role with unverified certificate status', () => {
      const memberSummary: UserSummary = {
        id: 'member-uuid-002',
        email: 'member@fitmate.vn',
        full_name: 'Nguyen Thi Member',
        role: 'member',
      };

      const domainMember = mapToDomainUser(memberSummary);

      expect(domainMember.profile.isPt).toBe(false);
      expect(domainMember.profile.isVerified).toBe(false);
      expect(domainMember.profile.certificateStatus).toBe('unverified');
    });
  });

  describe('3. Production Mock Exclusion', () => {
    it('throws real ApiError and never falls back to mock users on authentication failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          detail: 'Email hoặc mật khẩu không chính xác',
        }),
      } as any);

      let caughtError: any;
      try {
        await authService.login({
          email: 'invalid@fitmate.vn',
          password: 'SecretPassword123!',
        });
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(ApiError);
      expect(caughtError.status).toBe(401);
      expect(caughtError.message).toBe('Email hoặc mật khẩu không chính xác');
      // Must not fall back to in-memory user
      expect(sessionManager.getAccessToken()).toBeNull();
    });
  });

  describe('4. Automatic 401 Refresh & Single Retry in apiClient', () => {
    it('automatically refreshes token on 401 and retries original request', async () => {
      sessionManager.setAccessToken('old-stale-access-token');

      // Mock refreshSession to return new token
      const refreshSpy = vi
        .spyOn(sessionManager, 'refreshSession')
        .mockResolvedValue('fresh-new-access-token');

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(async (_url, options) => {
        callCount++;
        const authHeader = options?.headers?.Authorization;

        if (callCount === 1) {
          // First attempt with old token fails with 401
          expect(authHeader).toBe('Bearer old-stale-access-token');
          return {
            ok: false,
            status: 401,
            json: async () => ({ detail: 'Token expired' }),
          } as any;
        }

        // Second attempt with new token succeeds
        expect(authHeader).toBe('Bearer fresh-new-access-token');
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: 'protected-success' }),
        } as any;
      });

      const result = await apiClient<{ data: string }>('/protected-resource');

      expect(result).toEqual({ data: 'protected-success' });
      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(callCount).toBe(2);

      refreshSpy.mockRestore();
    });

    it('fails closed and avoids infinite loops if 401 persists on retry', async () => {
      sessionManager.setAccessToken('stale-token');

      const refreshSpy = vi
        .spyOn(sessionManager, 'refreshSession')
        .mockResolvedValue('fresh-token');

      // Both initial and retry return 401
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Still unauthorized' }),
      } as any);

      await expect(apiClient('/resource')).rejects.toThrow('Phiên đăng nhập đã hết hạn');

      // Refresh was attempted once
      expect(refreshSpy).toHaveBeenCalledTimes(1);

      refreshSpy.mockRestore();
    });
  });
});
