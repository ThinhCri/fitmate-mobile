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
  try {
    await SecureStore.setItemAsync(KEY_REFRESH_TOKEN, token);
  } catch {
    console.warn('[secureStore.setRefreshToken] failed');
  }
}

export async function deleteRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN);
  } catch {
    console.warn('[secureStore.deleteRefreshToken] failed');
  }
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
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_EMAIL);
    await SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEY_SESSION_USER);
  } catch {
    console.warn('[secureStore.clearAuth] failed');
  }
}
