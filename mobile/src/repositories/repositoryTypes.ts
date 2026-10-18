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
 * Preview data must never be selected in a release build.
 */
export function isPreviewMode(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_DATA_SOURCE === 'preview';
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
    if (!__DEV__) {
      throw new Error('Dữ liệu xem trước không được phép trong bản phát hành.');
    }
    return 'preview';
  }
  throw new Error(`Cấu hình nguồn dữ liệu không hợp lệ: "${source}". Ứng dụng từ chối tải dữ liệu (Fail Closed).`);
}
