/**
 * Repository and Data Port core types
 */

export type AsyncData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'offline'; cached?: T }
  | { status: 'forbidden' }
  | { status: 'session-expired' }
  | { status: 'error'; message: string; retryable: boolean };

/**
 * Checks if preview data source is explicitly enabled via environment variable.
 * Must evaluate strictly to 'preview'. Any other value or undefined defaults to production API mode.
 */
export function isPreviewMode(): boolean {
  return process.env.EXPO_PUBLIC_DATA_SOURCE === 'preview';
}

/**
 * Validates data source configuration.
 * Fails closed if unknown configuration is passed.
 */
export function getDataSourceMode(): 'api' | 'preview' {
  const source = process.env.EXPO_PUBLIC_DATA_SOURCE;
  if (!source || source === 'api') {
    return 'api';
  }
  if (source === 'preview') {
    return 'preview';
  }
  throw new Error(`Cấu hình nguồn dữ liệu không hợp lệ: "${source}". Ứng dụng từ chối tải dữ liệu (Fail Closed).`);
}
