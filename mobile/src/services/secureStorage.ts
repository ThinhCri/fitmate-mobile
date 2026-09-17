/**
 * Secure storage — wraps expo-secure-store for tokens.
 *
 * Use only for small encrypted values (auth token, refresh token).
 * Demo mock auth stores user email here so we can auto-resume the session.
 */
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
    // eslint-disable-next-line no-console
    console.warn('[secureStore.setAuthEmail] failed', err);
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_EMAIL);
    await SecureStore.deleteItemAsync(KEY_AUTH_TOKEN);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[secureStore.clearAuth] failed', err);
  }
}
