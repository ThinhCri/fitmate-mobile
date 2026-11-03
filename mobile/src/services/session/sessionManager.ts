import { withRequestDeadline } from '@/services/requestDeadline';
import {
  clearAuth,
  getRefreshToken,
  setAuthEmail,
  setCachedSessionUser,
  setRefreshToken,
} from '@/services/secureStorage';
import { AuthResponse, UserSummary } from '@/services/api/types';
import { getApiBaseUrl } from '@/services/api/baseUrl';

/**
 * Production Session Manager
 *
 * Enforces production authentication constraints:
 * 1. Access token is strictly held in memory only (never written to disk).
 * 2. Refresh token is stored in expo-secure-store.
 * 3. Token refresh is single-flight (concurrent 401s share the same refresh promise).
 * 4. Refresh failure triggers fail-closed session cleanup.
 * 5. Logout / account switch aborts all active network requests and wipes account-scoped state.
 */

const API_BASE_URL = getApiBaseUrl();

class SessionManager {
  private inMemoryAccessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private refreshPromiseGeneration: number = 0;
  private abortController: AbortController = new AbortController();
  private sessionExpiredListeners: Set<() => void> = new Set();
  private generation: number = 0;
  private storageQueue: Promise<void> = Promise.resolve();

  /**
   * Enqueue a storage operation guarded by generation epoch.
   * If generation advances before execution, the operation is discarded.
   */
  private enqueueStorageOp<T>(
    opGen: number,
    action: () => Promise<T>
  ): Promise<T | void> {
    const next = this.storageQueue.then(async () => {
      if (this.generation !== opGen) {
        return;
      }
      return await action();
    });
    this.storageQueue = next.then(
      () => {},
      () => {}
    );
    return next;
  }

  /**
   * Get current session generation epoch
   */
  getGeneration(): number {
    return this.generation;
  }

  /**
   * Get current in-memory access token
   */
  getAccessToken(): string | null {
    return this.inMemoryAccessToken;
  }

  /**
   * Set in-memory access token
   */
  setAccessToken(token: string | null): void {
    this.inMemoryAccessToken = token;
  }

  /**
   * Abort signal for in-flight requests scoped to the current session
   */
  getAbortSignal(): AbortSignal {
    return this.abortController.signal;
  }

  /**
   * Register listener for session expiry / fail-closed logout
   */
  onSessionExpired(callback: () => void): () => void {
    this.sessionExpiredListeners.add(callback);
    return () => {
      this.sessionExpiredListeners.delete(callback);
    };
  }

  private notifySessionExpired(): void {
    this.sessionExpiredListeners.forEach((cb) => {
      try {
        cb();
      } catch {
        console.warn('[SessionManager] listener error');
      }
    });
  }

  /**
   * Initialize a new session upon successful login or registration.
   * Cancels in-flight requests from any prior session and advances epoch.
   */
  async setSession(
    accessToken: string,
    refreshToken: string,
    user: UserSummary
  ): Promise<void> {
    // 1. Abort in-flight requests from prior account
    try {
      this.abortController.abort();
    } catch {
      // Ignore if already aborted
    }
    this.abortController = new AbortController();

    // 2. Advance generation to invalidate stale in-flight responses
    const sessionGen = ++this.generation;
    this.refreshPromise = null;
    this.inMemoryAccessToken = null;

    // 3. Commit new tokens and session cache
    await this.enqueueStorageOp(sessionGen, async () => {
      await clearAuth();
      await setRefreshToken(refreshToken);
      await setCachedSessionUser(user);
      if (user.email) {
        await setAuthEmail(user.email);
      }
    });
    if (this.generation !== sessionGen) {
      throw new Error('Phiên đã thay đổi hoặc bị hủy');
    }
    this.inMemoryAccessToken = accessToken;
  }

  /**
   * Single-flight token refresh with generation epoch guard.
   * Concurrent callers share the exact same refresh promise.
   */
  async refreshSession(): Promise<string> {
    if (this.refreshPromise && this.refreshPromiseGeneration === this.generation) {
      return this.refreshPromise;
    }

    const requestGeneration = this.generation;
    this.refreshPromiseGeneration = requestGeneration;
    const requestSignal = this.abortController.signal;

    this.refreshPromise = (async () => {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        if (this.generation === requestGeneration && !requestSignal.aborted) {
          await this.clearSession();
          this.notifySessionExpired();
        }
        throw new Error('Không có refresh token');
      }

      try {
        const data = await withRequestDeadline([requestSignal], async signal => {
        const response = await fetch(API_BASE_URL + '/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refresh_token: storedRefreshToken }),
          signal,
        });

        if (!response.ok) {
          throw new Error('Refresh token rejected: ' + response.status);
        }

        return (await response.json()) as AuthResponse;
        }, 20000);

        // Generation guard: discard stale response if session was cleared or switched
        if (this.generation !== requestGeneration || requestSignal.aborted) {
          throw new Error('Phiên đã thay đổi hoặc bị hủy');
        }

        await this.enqueueStorageOp(requestGeneration, async () => {
          if (data.refresh_token) {
            await setRefreshToken(data.refresh_token);
          }
          if (data.user) {
            await setCachedSessionUser(data.user);
          }
        });

        if (this.generation !== requestGeneration || requestSignal.aborted) {
          throw new Error('Phiên đã thay đổi hoặc bị hủy');
        }
        this.inMemoryAccessToken = data.access_token;

        return data.access_token;
      } catch (err) {
        // Only fail-closed if we are still on the same generation and not aborted externally
        if (this.generation === requestGeneration && !requestSignal.aborted) {
          await this.clearSession();
          this.notifySessionExpired();
        }
        throw err;
      } finally {
        // Prevent old promise in finally from clearing a newer session's promise
        if (this.generation === requestGeneration) {
          this.refreshPromise = null;
        }
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Clear session, abort active requests, and wipe tokens from SecureStore
   */
  async clearSession(): Promise<void> {
    // 1. Advance generation to prevent in-flight responses from restoring state
    const clearGen = ++this.generation;

    // 2. Abort any pending network requests from the previous account
    try {
      this.abortController.abort();
    } catch {
      // AbortController might already be aborted
    }
    this.abortController = new AbortController();

    // 3. Clear in-memory token and running refresh promise
    this.inMemoryAccessToken = null;
    this.refreshPromise = null;

    // 4. Clear stored refresh token and user via generation-guarded queue
    await this.enqueueStorageOp(clearGen, async () => {
      await clearAuth();
    });
  }
}

export const sessionManager = new SessionManager();
