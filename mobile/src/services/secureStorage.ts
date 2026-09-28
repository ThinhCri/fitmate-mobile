import * as SecureStore from 'expo-secure-store';

const KEY_AUTH_EMAIL = 'fitmate_auth_email';
const KEY_AUTH_TOKEN = 'fitmate_auth_token';

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
  } catch (err) {
    console.warn('[secureStore.setAuthEmail] failed', err);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY_AUTH_TOKEN);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY_AUTH_TOKEN, token);
  } catch (err) {
    console.warn('[secureStore.setAuthToken] failed', err);
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_EMAIL);
    await SecureStore.deleteItemAsync(KEY_AUTH_TOKEN);
  } catch (err) {
    console.warn('[secureStore.clearAuth] failed', err);
  }
}
