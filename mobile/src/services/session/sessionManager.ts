import {
  clearAuth,
  deleteRefreshToken,
  getRefreshToken,
  setAuthEmail,
  setCachedSessionUser,
  setRefreshToken,
} from '@/services/secureStorage';
import { AuthResponse, UserSummary } from '@/services/api/types';

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

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080/api/v1';
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

class SessionManager {
  private inMemoryAccessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private abortController: AbortController = new AbortController();
  private sessionExpiredListeners: Set<() => void> = new Set();

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
      } catch (err) {
        console.warn('[SessionManager] listener error', err);
      }
    });
  }

  /**
   * Initialize a new session upon successful login or registration
   */
  async setSession(
    accessToken: string,
    refreshToken: string,
    user: UserSummary
  ): Promise<void> {
    this.inMemoryAccessToken = accessToken;
    await setRefreshToken(refreshToken);
    await setCachedSessionUser(user);
    if (user.email) {
      await setAuthEmail(user.email);
    }
  }

  /**
   * Single-flight token refresh
   * Concurrent callers share the exact same refresh promise.
   */
  async refreshSession(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        await this.clearSession();
        this.notifySessionExpired();
        throw new Error('Không có refresh token');
      }

      try {
        const response = await fetch(API_BASE_URL + '/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refresh_token: storedRefreshToken }),
        });

        if (!response.ok) {
          throw new Error('Refresh token rejected: ' + response.status);
        }

        const data = (await response.json()) as AuthResponse;
        this.inMemoryAccessToken = data.access_token;

        if (data.refresh_token) {
          await setRefreshToken(data.refresh_token);
        }
        if (data.user) {
          await setCachedSessionUser(data.user);
        }

        return data.access_token;
      } catch (err) {
        // Fail-closed: invalid or expired refresh token triggers full session cleanup
        await this.clearSession();
        this.notifySessionExpired();
        throw err;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Clear session, abort active requests, and wipe tokens from SecureStore
   */
  async clearSession(): Promise<void> {
    // 1. Abort any pending network requests from the previous account
    try {
      this.abortController.abort();
    } catch {
      // AbortController might already be aborted
    }
    this.abortController = new AbortController();

    // 2. Clear in-memory token
    this.inMemoryAccessToken = null;
    this.refreshPromise = null;

    // 3. Clear stored refresh token and user
    await deleteRefreshToken();
    await clearAuth();
  }
}

export const sessionManager = new SessionManager();
