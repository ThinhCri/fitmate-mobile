import { withRequestDeadline, RequestTimeoutError } from '@/services/requestDeadline';
import { sessionManager } from '@/services/session/sessionManager';
import { getUserFacingApiErrorMessage } from './errorMessages';
import * as FileSystem from 'expo-file-system/legacy';
import { File as ExpoFile } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { getApiBaseUrl } from './baseUrl';
import { normalizeApiResourceUrl } from './resourceUrl';

const API_BASE_URL = getApiBaseUrl();
let rateLimitedUntil = 0;

async function waitForRateLimitWindow(signal: AbortSignal): Promise<void> {
  if (signal.aborted) { const error = new Error('Yêu cầu đã bị hủy'); error.name = 'AbortError'; throw error; }
  const delayMs = rateLimitedUntil - Date.now();
  if (delayMs <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timer);
      const error = new Error('Yêu cầu đã bị hủy');
      error.name = 'AbortError';
      reject(error);
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Rewrites loopback URLs returned by a local Docker API to the same origin the
 * device already uses for API calls. A physical phone cannot resolve the
 * backend container's `localhost` address.
 */
export function resolveApiResourceUrl(value: string): string {
  return normalizeApiResourceUrl(value, API_BASE_URL);
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

export async function apiUploadFile<T>(
  endpoint: string,
  fileUri: string,
  mimeType: string,
  parameters: Record<string, string>
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const token = sessionManager.getAccessToken();

  try {
    const response = await FileSystem.uploadAsync(API_BASE_URL + cleanEndpoint, fileUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType,
      parameters,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    });

    let data: unknown;
    try {
      data = response.body ? JSON.parse(response.body) : {};
    } catch {
      data = response.body;
    }

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError(
        getUserFacingApiErrorMessage(response.status, data),
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Không thể đọc hoặc tải ảnh lên. Vui lòng tải ảnh về thiết bị rồi thử lại.',
      0,
      error instanceof Error ? error.message : undefined
    );
  }
}

export async function apiUploadFiles<T>(
  endpoint: string,
  files: Array<{ uri: string; mimeType?: string | null; fileName?: string | null }>,
  parameters: Record<string, string>
): Promise<T> {
  if (files.length === 1) {
    const file = files[0];
    const mimeType = file.mimeType === 'image/png' || file.mimeType === 'image/webp'
      ? file.mimeType
      : 'image/jpeg';
    return apiUploadFile<T>(endpoint, file.uri, mimeType, parameters);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const token = sessionManager.getAccessToken();
  const temporaryUris: string[] = [];

  try {
    const form = new FormData();
    Object.entries(parameters).forEach(([key, value]) => form.append(key, value));

    for (const [index, file] of files.slice(0, 5).entries()) {
      const mimeType = file.mimeType === 'image/png' || file.mimeType === 'image/webp'
        ? file.mimeType
        : 'image/jpeg';
      const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
      if (!FileSystem.cacheDirectory) throw new Error('Không tìm thấy thư mục tạm của ứng dụng.');
      const uploadUri = `${FileSystem.cacheDirectory}fitmate-upload-${Date.now()}-${index}.${extension}`;
      await FileSystem.copyAsync({ from: file.uri, to: uploadUri });
      temporaryUris.push(uploadUri);

      // Expo File is a real native Blob. A plain React Native { uri, name, type }
      // object is not a Blob and fails intermittently when several Android files
      // are appended to the same multipart request.
      form.append('files', new ExpoFile(uploadUri));
    }

    const response = await expoFetch(API_BASE_URL + cleanEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: form,
      signal: sessionManager.getAbortSignal(),
    });
    const rawBody = await response.text();
    let data: unknown = rawBody;
    if (rawBody) {
      try { data = JSON.parse(rawBody); } catch { /* Keep the server's plain-text error. */ }
    } else {
      data = {};
    }
    if (!response.ok) {
      throw new ApiError(getUserFacingApiErrorMessage(response.status, data), response.status, data);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Không thể đọc hoặc tải ảnh lên. Vui lòng tải ảnh về thiết bị rồi thử lại.',
      0,
      error instanceof Error ? error.message : undefined
    );
  } finally {
    await Promise.all(temporaryUris.map((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)));
  }
}

interface RequestOptions extends RequestInit {
  _isRetry?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
 try { return await withRequestDeadline([options.signal, sessionManager.getAbortSignal()], signal => apiClientAttempt<T>(endpoint, {...options, signal}), endpoint.startsWith('/me/workout/suggestions') || endpoint.startsWith('/ai/') ? 90000 : 30000); }
 catch(error) { if(error instanceof RequestTimeoutError) throw new ApiError('Máy chủ phản hồi quá lâu. Vui lòng thử lại.',408); throw error; }
}

async function apiClientAttempt<T>(
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
    await waitForRateLimitWindow(signal);
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
        cleanEndpoint.startsWith('/auth/email/') ||
        cleanEndpoint.startsWith('/auth/password/');

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
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const retrySeconds = retryAfter && /^\d+$/.test(retryAfter)
          ? Number(retryAfter)
          : 5;
        rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + Math.min(15, Math.max(1, retrySeconds)) * 1000);
      }
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
