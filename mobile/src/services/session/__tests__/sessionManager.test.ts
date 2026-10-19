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
import { sessionManager } from '../sessionManager';
import * as SecureStore from 'expo-secure-store';

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

  it('does not expose an access token when secure refresh-token storage fails', async () => {
    vi.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('device storage unavailable'));
    await expect(sessionManager.setSession('access', 'refresh', {
      id: 'usr-1', email: 'member@fitmate.vn', full_name: 'Member', role: 'member',
    })).rejects.toThrow();
    expect(sessionManager.getAccessToken()).toBeNull();
    expect(secureStoreMock.get('fitmate_refresh_token')).toBeUndefined();
  });

  it('drops the prior account token before switching accounts', async () => {
    await sessionManager.setSession('old-access', 'old-refresh', {
      id: 'old-user', email: 'old@fitmate.vn', full_name: 'Old', role: 'member',
    });
    vi.mocked(SecureStore.deleteItemAsync).mockRejectedValueOnce(new Error('device storage unavailable'));
    await expect(sessionManager.setSession('new-access', 'new-refresh', {
      id: 'new-user', email: 'new@fitmate.vn', full_name: 'New', role: 'member',
    })).rejects.toThrow('Không thể xóa');
    expect(sessionManager.getAccessToken()).toBeNull();
    expect(secureStoreMock.get('fitmate_refresh_token')).toBeUndefined();
  });

  it('reports failed credential deletion instead of pretending logout completed', async () => {
    secureStoreMock.set('fitmate_refresh_token', 'refresh');
    vi.mocked(SecureStore.deleteItemAsync).mockRejectedValueOnce(new Error('device storage unavailable'));
    await expect(sessionManager.clearSession()).rejects.toThrow('Không thể xóa');
    expect(sessionManager.getAccessToken()).toBeNull();
    expect(secureStoreMock.get('fitmate_refresh_token')).toBeUndefined();
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

  it('6. Aborts pending refresh when clearSession is called during refresh', async () => {
    secureStoreMock.set('fitmate_refresh_token', 'refresh-token-pending');

    let resolveFetch: (val: any) => void;
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const refreshPromise = sessionManager.refreshSession();

    // While refresh is pending, clearSession is called
    await sessionManager.clearSession();

    // Resolve the old fetch now
    resolveFetch!({
      ok: true,
      json: async () => ({
        access_token: 'stale-token-after-logout',
        refresh_token: 'stale-refresh-after-logout',
        user: { id: 'stale-usr', email: 'stale@fitmate.vn', role: 'member' },
      }),
    });

    // The refresh promise must reject because generation changed / signal aborted
    await expect(refreshPromise).rejects.toThrow();

    // Access token must remain null and storage clean
    expect(sessionManager.getAccessToken()).toBeNull();
    expect(secureStoreMock.get('fitmate_refresh_token')).toBeUndefined();
  });

  it('7. Discards stale refresh response when switched to new user before refresh resolves', async () => {
    secureStoreMock.set('fitmate_refresh_token', 'old-user-refresh');

    let resolveFetch: (val: any) => void;
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const refreshPromise = sessionManager.refreshSession();

    // Account B logs in before Account A's refresh finishes
    await sessionManager.setSession('user-b-access', 'user-b-refresh', {
      id: 'usr-b',
      email: 'userb@fitmate.vn',
      full_name: 'User B',
      role: 'member',
    });

    // Now resolve the old fetch for Account A
    resolveFetch!({
      ok: true,
      json: async () => ({
        access_token: 'stale-user-a-access',
        refresh_token: 'stale-user-a-refresh',
        user: { id: 'usr-a', email: 'usera@fitmate.vn', role: 'member' },
      }),
    });

    // The old refresh promise must reject
    await expect(refreshPromise).rejects.toThrow();

    // Crucially: Account B's session was NOT overwritten by stale Account A response!
    expect(sessionManager.getAccessToken()).toBe('user-b-access');
    expect(secureStoreMock.get('fitmate_refresh_token')).toBe('user-b-refresh');
    expect(secureStoreMock.get('fitmate_session_user')).toContain('userb@fitmate.vn');
  });

  it('8. Ensures old refresh finally block does not corrupt newer session', async () => {
    secureStoreMock.set('fitmate_refresh_token', 'initial-refresh');

    let resolveOldFetch: (val: any) => void;
    global.fetch = vi.fn().mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOldFetch = resolve;
        })
    );

    const oldRefresh = sessionManager.refreshSession();

    // User switches session
    await sessionManager.setSession('new-user-access', 'new-user-refresh', {
      id: 'usr-new',
      email: 'new@fitmate.vn',
      full_name: 'New User',
      role: 'member',
    });

    // Resolve old fetch
    resolveOldFetch!({
      ok: true,
      json: async () => ({
        access_token: 'old-access',
        refresh_token: 'old-refresh',
        user: { id: 'usr-old', email: 'old@fitmate.vn', role: 'member' },
      }),
    });

    await expect(oldRefresh).rejects.toThrow();
    expect(sessionManager.getAccessToken()).toBe('new-user-access');
  });
});
