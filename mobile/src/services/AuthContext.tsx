/**
 * Production AuthContext
 *
 * Implements:
 * 1. Memory-only access token via SessionManager.
 * 2. SecureStore refresh token.
 * 3. Single-flight refresh with 401 retry in apiClient.
 * 4. Fail-closed logout on refresh failure.
 * 5. Request cancellation and account-scoped cache clearing on logout.
 * 6. Zero mock fallbacks on API errors.
 * 7. Zero plaintext password persistence.
 * 8. PT registration starts as unverified.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { authService } from '@/services/api/authService';
import { sessionManager } from '@/services/session/sessionManager';
import {
  getCachedSessionUser,
  getRefreshToken,
} from '@/services/secureStorage';
import {
  RegisterRequest,
  UserProfile,
  UserSummary,
} from '@/services/api/types';

import { mapToDomainUser } from '@/services/session/userMapper';
export { mapToDomainUser };

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
  role?: 'member' | 'pt';
  profile?: Partial<User['profile']>;
  heightCm?: number;
  weightKg?: number;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  fitnessGoal?: string;
  trainingDays?: string[];
  specialty?: string;
  experienceYears?: number;
  pricePerSessionVnd?: number;
  timezone?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  saveUser: (user: User) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(async () => {
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        setUser(null);
        return;
      }

      // Single-flight refresh token exchange
      await sessionManager.refreshSession();
      const cachedSummary = await getCachedSessionUser<UserSummary>();

      if (cachedSummary) {
        try {
          const profile = await authService.getMe();
          setUser(mapToDomainUser(cachedSummary, profile));
        } catch {
          setUser(mapToDomainUser(cachedSummary));
        }
      }
    } catch {
      // Refresh failed — fail closed
      await sessionManager.clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initSession();
      } finally {
        setLoading(false);
      }
    })();

    // Listen to session expiry (e.g. 401 refresh failed)
    const unsubscribe = sessionManager.onSessionExpired(() => {
      setUser(null);
    });

    return () => {
      unsubscribe();
    };
  }, [initSession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const authRes = await authService.login({ email, password });
      await sessionManager.setSession(
        authRes.access_token,
        authRes.refresh_token,
        authRes.user
      );

      let profile: UserProfile | null = null;
      try {
        profile = await authService.getMe();
      } catch {
        // Fall back to summary if getMe is temporarily unavailable
      }

      setUser(mapToDomainUser(authRes.user, profile));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Đăng nhập không thành công';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const fullName = input.fullName || input.profile?.name || 'Người dùng Fitmate';
      const role: 'member' | 'pt' = input.role || (input.profile?.isPt ? 'pt' : 'member');
      const req: RegisterRequest = {
        email: input.email,
        password: input.password,
        full_name: fullName,
        role,
        height_cm: input.heightCm ?? input.profile?.height,
        weight_kg: input.weightKg ?? input.profile?.weight,
        gender: input.gender,
        birthday: input.birthday ?? input.profile?.birthday,
        fitness_goal: input.fitnessGoal ?? input.profile?.goal,
        training_days: input.trainingDays ?? input.profile?.trainingDays,
        specialty:
          input.specialty ??
          (input.profile?.spec ? input.profile.spec.join(', ') : undefined),
        experience_years: input.experienceYears ?? input.profile?.exp,
        price_per_session_vnd: input.pricePerSessionVnd ?? input.profile?.price,
        timezone: input.timezone,
      };

      const authRes = await authService.register(req);
      await sessionManager.setSession(
        authRes.access_token,
        authRes.refresh_token,
        authRes.user
      );

      let profile: UserProfile | null = null;
      try {
        profile = await authService.getMe();
      } catch {
        // Optional profile fetch
      }

      setUser(mapToDomainUser(authRes.user, profile));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Đăng ký không thành công';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Continue cleanup regardless of network status
    } finally {
      await sessionManager.clearSession();
      setUser(null);
    }
  }, []);

  const signOut = logout;

  const refresh = useCallback(async () => {
    const cachedSummary = await getCachedSessionUser<UserSummary>();
    if (!cachedSummary) return;

    try {
      const profile = await authService.getMe();
      setUser(mapToDomainUser(cachedSummary, profile));
    } catch (err) {
      console.warn('[AuthContext.refresh] failed to refresh profile', err);
    }
  }, []);

  const saveUser = useCallback(async (next: User) => {
    setUser(next);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      signOut,
      refresh,
      saveUser,
      setUser,
      clearError,
    }),
    [user, loading, error, login, register, logout, signOut, refresh, saveUser, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
