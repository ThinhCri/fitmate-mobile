import { PermissionsAndroid, Platform } from 'react-native';
import { apiClient } from '@/services/api/client';
import { getApiBaseUrl } from '@/services/api/baseUrl';
import { systemService } from '@/services/api/systemService';
import { sessionManager } from '@/services/session/sessionManager';

type MessagingApi = typeof import('@react-native-firebase/messaging');
let api: MessagingApi | null = null;
let epoch = 0;
let owner: string | null = null;
let deviceId: string | null = null;
let queue: Promise<unknown> = Promise.resolve();
let unsubscribe: (() => void) | null = null;

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const result = queue.then(work); queue = result.catch(() => undefined); return result;
}

export async function syncPushSession(userId: string): Promise<void> {
  if (Platform.OS !== 'android') return;
  const generation = sessionManager.getGeneration();
  const version = epoch;
  await enqueue(async () => {
    if (version !== epoch || generation !== sessionManager.getGeneration()) return;
    if (Number(Platform.Version) >= 33 && !await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)) {
      if (api) { await api.setAutoInitEnabled(api.getMessaging(), false); await api.deleteToken(api.getMessaging()); }
      return;
    }
    const capabilities = await systemService.getCapabilities();
    if (!capabilities.push_notifications_enabled || version !== epoch || generation !== sessionManager.getGeneration()) return;
    api ??= await import('@react-native-firebase/messaging');
    const messaging = api.getMessaging();
    await api.setAutoInitEnabled(messaging, true);
    const token = await api.getToken(messaging);
    if (version !== epoch || generation !== sessionManager.getGeneration()) return;
    const result = await apiClient<{ device_id: string }>('/users/me/devices', {
      method: 'POST', body: JSON.stringify({ deviceToken: token, platform: 'android', provider: 'fcm' }),
    });
    if (version !== epoch || generation !== sessionManager.getGeneration()) return;
    owner = userId; deviceId = result.device_id;
    unsubscribe?.();
    unsubscribe = api.onTokenRefresh(messaging, () => { void syncPushSession(userId).catch(() => undefined); });
  });
}

/** Synchronously invalidate jobs. Native token deletion is serialized before the next registration. */
export function stopPushSession(tokenSnapshot: string | null = sessionManager.getAccessToken()): Promise<void> {
  epoch++; owner = null; const previousDevice = deviceId; deviceId = null;
  unsubscribe?.(); unsubscribe = null;
  return enqueue(async () => {
    if (api) {
      try { await api.setAutoInitEnabled(api.getMessaging(), false); await api.deleteToken(api.getMessaging()); }
      catch { /* No private payload is ever included in lock-screen push. Retry cleanup next session. */ }
    }
    if (!previousDevice || !tokenSnapshot) return;
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 5000);
    try {
      // Captured credential, no refresh/retry into a different account, independent of cleared session signal.
      await fetch(`${getApiBaseUrl()}/users/me/devices/${encodeURIComponent(previousDevice)}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${tokenSnapshot}` }, signal: controller.signal,
      });
    } catch { /* A failed server revoke cannot delay logout; native token was invalidated first. */ }
    finally { clearTimeout(timer); }
  });
}

export function currentPushOwner(): string | null { return owner; }
