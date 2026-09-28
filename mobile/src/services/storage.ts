/**
 * Storage wrapper — AsyncStorage with typed get/set/remove.
 *
 * Used by mock services (services/mockUserService.ts) to persist the demo
 * user DB across app restarts. Matches web localStorage API shape but JSON
 * stringified (AsyncStorage stores strings only).
 *
 * Production note: `secureStorage` is reserved for tokens (auth), uses
 * expo-secure-store. UI mock state goes through `storage` (AsyncStorage).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_PREFIX = 'fitmate_';

export async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage.get] ${key} parse failed`, err);
    return null;
  }
}

export async function set<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage.set] ${key} write failed`, err);
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key);
  } catch (err) {
    console.warn(`[storage.remove] ${key} delete failed`, err);
  }
}

export async function multiGet<T extends Record<string, unknown>>(
  keys: readonly (keyof T & string)[],
): Promise<Partial<T>> {
  try {
    const fullKeys = keys.map((k) => STORAGE_PREFIX + k);
    const pairs = await AsyncStorage.multiGet(fullKeys);
    const out: Partial<T> = {};
    pairs.forEach(([k, value], i) => {
      const key = keys[i];
      if (value != null) {
        try {
          // Safe cast: key is a string key of T
          (out as Record<string, unknown>)[key] = JSON.parse(value);
        } catch {
          /* ignore parse error */
        }
      }
    });
    return out;
  } catch (err) {
    console.warn('[storage.multiGet] failed', err);
    return {};
  }
}

export async function multiSet(entries: Record<string, unknown>): Promise<void> {
  try {
    const pairs: [string, string][] = Object.entries(entries).map(([k, v]) => [
      STORAGE_PREFIX + k,
      JSON.stringify(v),
    ]);
    await AsyncStorage.multiSet(pairs);
  } catch (err) {
    console.warn('[storage.multiSet] failed', err);
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prefixed = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(prefixed);
  } catch (err) {
    console.warn('[storage.clearAll] failed', err);
  }
}

const KEY_HAS_SEEN_WELCOME = 'has_seen_welcome';

export async function getHasSeenWelcome(): Promise<boolean> {
  const val = await get<boolean>(KEY_HAS_SEEN_WELCOME);
  return val === true;
}

export async function setHasSeenWelcome(seen: boolean): Promise<void> {
  await set<boolean>(KEY_HAS_SEEN_WELCOME, seen);
}
