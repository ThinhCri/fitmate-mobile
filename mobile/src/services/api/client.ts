import { sessionManager } from '@/services/session/sessionManager';
import { getUserFacingApiErrorMessage } from './errorMessages';

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080/api/v1';
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Rewrites loopback URLs returned by a local Docker API to the same origin the
 * device already uses for API calls. A physical phone cannot resolve the
 * backend container's `localhost` address.
 */
export function resolveApiResourceUrl(value: string): string {
  try {
    const resource = new URL(value);
    if (!['localhost', '127.0.0.1', '10.0.2.2'].includes(resource.hostname)) {
      return value;
    }

    const apiOrigin = new URL(API_BASE_URL).origin;
    return apiOrigin + resource.pathname + resource.search + resource.hash;
  } catch {
    return value;
  }
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

interface RequestOptions extends RequestInit {
  _isRetry?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = API_BASE_URL + cleanEndpoint;

  const requestGen = sessionManager.getGeneration();
  const token = sessionManager.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = 'Bearer ' + token;
  }

  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const signal = options.signal || sessionManager.getAbortSignal();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal,
    });

    // Guard against stale response if session changed while request was in-flight
    if (sessionManager.getGeneration() !== requestGen || signal.aborted) {
      const abortError = new Error('Yêu cầu bị hủy do thay đổi phiên đăng nhập');
      abortError.name = 'AbortError';
      throw abortError;
    }

    // 401 Handling: Automatic single-flight refresh and retry
    if (response.status === 401 && !options._isRetry) {
      const isAuthEndpoint =
        cleanEndpoint.startsWith('/auth/login') ||
        cleanEndpoint.startsWith('/auth/refresh') ||
        cleanEndpoint.startsWith('/auth/register') ||
        cleanEndpoint.startsWith('/auth/email/');

      if (!isAuthEndpoint) {
        try {
          const newToken = await sessionManager.refreshSession();
          return await apiClient<T>(cleanEndpoint, {
            ...options,
            _isRetry: true,
            headers: {
              ...(options.headers as Record<string, string>),
              Authorization: 'Bearer ' + newToken,
            },
          });
        } catch (refreshErr) {
          if (isAbortError(refreshErr)) {
            throw refreshErr;
          }
          // Refresh failed — fail-closed
          throw new ApiError('Phiên đăng nhập đã hết hạn', 401);
        }
      }
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      throw new ApiError(
        getUserFacingApiErrorMessage(response.status, errorData),
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError(
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      0,
      error instanceof Error ? error.message : undefined
    );
  }
}
