/**
 * SessionManager Tests (MOB-800)
 *
 * Verifies production session architecture:
 * 1. Access token is strictly held in memory only (never written to disk).
 * 2. Refresh token stored in SecureStore.
 * 3. Single-flight refresh prevents redundant network calls.
 * 4. Refresh rejection fails closed and notifies listeners.
 * 5. Session clear aborts active in-flight requests and wipes storage.
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

import { sessionManager } from '../sessionManager';

describe('SessionManager (MOB-800)', () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    secureStoreMock.clear();
    await sessionManager.clearSession();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. Holds access token in-memory only and never persists it to SecureStore', async () => {
    const userSummary = {
      id: 'usr-123',
      email: 'member@fitmate.vn',
      full_name: 'Nguyen Van A',
      role: 'member' as const,
    };

    await sessionManager.setSession('test-access-token-123', 'test-refresh-token-456', userSummary);

    // In-memory access token is retrievable
    expect(sessionManager.getAccessToken()).toBe('test-access-token-123');

    // Access token is NEVER stored in SecureStore
    expect(secureStoreMock.get('fitmate_auth_token')).toBeUndefined();
    expect(secureStoreMock.get('fitmate_access_token')).toBeUndefined();

    // Only refresh token and user metadata are stored
    expect(secureStoreMock.get('fitmate_refresh_token')).toBe('test-refresh-token-456');
    expect(secureStoreMock.get('fitmate_session_user')).toContain('usr-123');
  });

  it('2. Coalesces concurrent 401 refresh calls into a single-flight network request', async () => {
    secureStoreMock.set('fitmate_refresh_token', 'initial-refresh-token');

    let fetchCalls = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      fetchCalls++;
      // Artificial delay to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 50));
      return {
        ok: true,
        json: async () => ({
          access_token: 'new-coalesced-access-token',
          refresh_token: 'new-refresh-token-789',
          expires_in: 3600,
          user: { id: 'usr-1', email: 'test@fitmate.vn', role: 'member' },
        }),
      } as any;
    });

    // Fire two concurrent refresh requests
    const [token1, token2] = await Promise.all([
      sessionManager.refreshSession(),
      sessionManager.refreshSession(),
    ]);

    // Both callers receive the identical fresh token
    expect(token1).toBe('new-coalesced-access-token');
    expect(token2).toBe('new-coalesced-access-token');

    // Network request was only fired once (single-flight)
    expect(fetchCalls).toBe(1);
    expect(sessionManager.getAccessToken()).toBe('new-coalesced-access-token');
    expect(secureStoreMock.get('fitmate_refresh_token')).toBe('new-refresh-token-789');
  });

  it('3. Fails closed when refresh is rejected and notifies session expiry listeners', async () => {
    secureStoreMock.set('fitmate_refresh_token', 'expired-refresh-token');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as any);

    let expiredNotified = false;
    const unsubscribe = sessionManager.onSessionExpired(() => {
      expiredNotified = true;
    });

    await expect(sessionManager.refreshSession()).rejects.toThrow();

    // Session must be fail-closed: access token wiped
    expect(sessionManager.getAccessToken()).toBeNull();
    // Refresh token removed
    expect(secureStoreMock.get('fitmate_refresh_token')).toBeUndefined();
    // Expiry listener fired
    expect(expiredNotified).toBe(true);

    unsubscribe();
  });

  it('4. Aborts active in-flight requests and wipes tokens upon clearSession (logout)', async () => {
    await sessionManager.setSession('token-to-clear', 'refresh-to-clear', {
      id: 'usr-999',
      email: 'clear@fitmate.vn',
      full_name: 'Clear User',
      role: 'member',
    });

    const activeSignal = sessionManager.getAbortSignal();
    expect(activeSignal.aborted).toBe(false);

    // Call logout / clearSession
    await sessionManager.clearSession();

    // Active signal for previous account must be aborted
    expect(activeSignal.aborted).toBe(true);
    expect(sessionManager.getAccessToken()).toBeNull();
    expect(secureStoreMock.get('fitmate_refresh_token')).toBeUndefined();
    expect(secureStoreMock.get('fitmate_session_user')).toBeUndefined();

    // Subsequent session gets a fresh, non-aborted signal
    const newSignal = sessionManager.getAbortSignal();
    expect(newSignal.aborted).toBe(false);
  });

  it('5. Supports clean account switching without stale token leakage', async () => {
    // User 1
    await sessionManager.setSession('user-1-token', 'user-1-refresh', {
      id: 'usr-1',
      email: 'user1@fitmate.vn',
      full_name: 'User One',
      role: 'member',
    });
    expect(sessionManager.getAccessToken()).toBe('user-1-token');

    // Switch to User 2
    await sessionManager.setSession('user-2-token', 'user-2-refresh', {
      id: 'usr-2',
      email: 'pt@fitmate.vn',
      full_name: 'PT Two',
      role: 'pt',
    });

    expect(sessionManager.getAccessToken()).toBe('user-2-token');
    expect(secureStoreMock.get('fitmate_refresh_token')).toBe('user-2-refresh');
    expect(secureStoreMock.get('fitmate_session_user')).toContain('pt@fitmate.vn');
  });
});
