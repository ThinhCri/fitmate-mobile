import { sessionManager } from '@/services/session/sessionManager';

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080/api/v1';
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

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

interface RequestOptions extends RequestInit {
  _isRetry?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = API_BASE_URL + cleanEndpoint;

  const token = sessionManager.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = 'Bearer ' + token;
  }

  const signal = options.signal || sessionManager.getAbortSignal();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal,
    });

    // 401 Handling: Automatic single-flight refresh and retry
    if (response.status === 401 && !options._isRetry) {
      const isAuthEndpoint =
        cleanEndpoint.startsWith('/auth/login') ||
        cleanEndpoint.startsWith('/auth/refresh') ||
        cleanEndpoint.startsWith('/auth/register');

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
        } catch {
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
        'API request failed with status ' + response.status,
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
    throw new ApiError(
      error instanceof Error ? error.message : 'Lỗi kết nối mạng',
      0
    );
  }
}
