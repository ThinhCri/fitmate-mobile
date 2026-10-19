import * as SecureStore from 'expo-secure-store';

const KEY_AUTH_EMAIL = 'fitmate_auth_email';
const KEY_REFRESH_TOKEN = 'fitmate_refresh_token';
const KEY_SESSION_USER = 'fitmate_session_user';

export async function getAuthEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY_AUTH_EMAIL);
  } catch {
    return null;
  }
}

export async function setAuthEmail(email: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY_AUTH_EMAIL, email);
  } catch {
    console.warn('[secureStore.setAuthEmail] failed');
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY_REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEY_REFRESH_TOKEN, token);
}

export async function deleteRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN);
}

export async function getCachedSessionUser<T>(): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY_SESSION_USER);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedSessionUser<T>(user: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY_SESSION_USER, JSON.stringify(user));
  } catch {
    console.warn('[secureStore.setCachedSessionUser] failed');
  }
}

export async function deleteCachedSessionUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_SESSION_USER);
  } catch {
    console.warn('[secureStore.deleteCachedSessionUser] failed');
  }
}

export async function clearAuth(): Promise<void> {
  const results = await Promise.allSettled([
    SecureStore.deleteItemAsync(KEY_AUTH_EMAIL),
    SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN),
    SecureStore.deleteItemAsync(KEY_SESSION_USER),
  ]);
  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('Không thể xóa toàn bộ dữ liệu đăng nhập an toàn trên thiết bị.');
  }
}
