import Constants from 'expo-constants';
import { withRequestDeadline, RequestTimeoutError } from '@/services/requestDeadline';
import { sessionManager } from '@/services/session/sessionManager';
import { getUserFacingApiErrorMessage } from './errorMessages';
import * as FileSystem from 'expo-file-system/legacy';
import { File as ExpoFile } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { getApiBaseUrl } from './baseUrl';
import { normalizeApiResourceUrl } from './resourceUrl';

const API_BASE_URL = getApiBaseUrl();
const rateLimits = new Map<string, number>();
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
  return uploadMultipart<T>(endpoint, [{ uri: fileUri, mimeType }], parameters, 'file');
}

export async function apiUploadFiles<T>(
  endpoint: string,
  files: Array<{ uri: string; mimeType?: string | null; fileName?: string | null }>,
  parameters: Record<string, string>
): Promise<T> {
  return uploadMultipart<T>(endpoint, files, parameters, files.length === 1 ? 'file' : 'files');
}

async function uploadMultipart<T>(endpoint: string, files: Array<{ uri: string; mimeType?: string | null }>, parameters: Record<string, string>, field: string): Promise<T> {
  if (!files.length || files.length > 5) throw new ApiError('Vui lòng chọn từ 1 đến 5 ảnh.', 400);
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
      const uploadUri = `${FileSystem.cacheDirectory}fitmate-upload-${Date.now()}-${Math.random().toString(36).slice(2)}-${index}.${extension}`;
      await FileSystem.copyAsync({ from: file.uri, to: uploadUri });
      temporaryUris.push(uploadUri);

      // Expo File is a real native Blob. A plain React Native { uri, name, type }
      // object is not a Blob and fails intermittently when several Android files
      // are appended to the same multipart request.
      form.append(field, new ExpoFile(uploadUri));
    }

    return await apiClient<T>(endpoint, { method: 'POST', body: form, _transport: expoFetch as typeof fetch, _timeoutMs: 90000 });
  } catch (error) {
    if (error instanceof ApiError || isAbortError(error)) throw error;
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
  _transport?: typeof fetch;
  _timeoutMs?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
 try { return await withRequestDeadline([options.signal, sessionManager.getAbortSignal()], signal => apiClientAttempt<T>(endpoint, {...options, signal}), options._timeoutMs ?? (endpoint.startsWith('/me/workout/suggestions') || endpoint.startsWith('/ai/') || endpoint.startsWith('/chat/ai/messages') ? 90000 : 30000)); }
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
    // Expo SDK 57 no longer exports nativeBuildVersion; use this build's embedded config.
    ...(Constants.expoConfig?.android?.versionCode ? { 'X-Fitmate-Android-Version-Code': String(Constants.expoConfig.android.versionCode) } : {}),
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
    const rateKey = requestGen + ':' + cleanEndpoint.split('?')[0];
    if ((rateLimits.get(rateKey) || 0) > Date.now()) throw new ApiError('Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.', 429);
    rateLimits.delete(rateKey);
    const { _transport, _timeoutMs, _isRetry, ...fetchOptions } = options;
    const response = await (_transport || fetch)(url, {
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
          const currentToken = sessionManager.getAccessToken();
          const newToken = currentToken && currentToken !== token ? currentToken : await sessionManager.refreshSession();
          return await apiClientAttempt<T>(cleanEndpoint, {
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
        rateLimits.set(rateKey, Date.now() + Math.min(300, Math.max(1, retrySeconds)) * 1000);
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
