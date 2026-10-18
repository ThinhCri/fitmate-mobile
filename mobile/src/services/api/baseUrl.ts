const LOCAL_DEVELOPMENT_URL = 'http://10.0.2.2:8080/api/v1';

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const value = configured || (__DEV__ ? LOCAL_DEVELOPMENT_URL : '');

  if (!value) {
    throw new Error('Bản phát hành yêu cầu EXPO_PUBLIC_API_BASE_URL.');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_API_BASE_URL không phải URL hợp lệ.');
  }

  if (url.username || url.password || url.search || url.hash || !url.pathname.replace(/\/+$/, '').endsWith('/api/v1')) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL phải là địa chỉ API /api/v1 không chứa thông tin đăng nhập hoặc query.');
  }
  if (!__DEV__ && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname))) {
    throw new Error('Bản phát hành chỉ được kết nối API HTTPS công khai.');
  }

  return url.toString().replace(/\/+$/, '');
}
