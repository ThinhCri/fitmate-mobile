import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from './AuthContext';
import { requestInitialPermissionsOnce } from './initialPermissions';
import { syncPushSession, stopPushSession } from './pushSession';

export function PushLifecycle() {
  const { user } = useAuth(); const pathname = usePathname();
  useEffect(() => {
    if (!user || Platform.OS !== 'android' || !pathname.includes('dashboard')) return;
    let active = true;
    void requestInitialPermissionsOnce(user.email).then(() => {
      if (active) return syncPushSession(user.id);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [user?.id, user?.email, pathname]);
  useEffect(() => {
    if (!user || Platform.OS !== 'android') return;
    let active = true; let detach: (() => void) | undefined;
    const accountId = user.id;
    void import('@react-native-firebase/messaging').then(async (messaging) => {
      if (!active) return;
      const openInbox = () => { if (active) router.push('/notifications' as never); };
      detach = messaging.onNotificationOpenedApp(messaging.getMessaging(), openInbox);
      if (await messaging.getInitialNotification(messaging.getMessaging())) openInbox();
    }).catch(() => undefined); // Old native build / Expo Go has no messaging module.
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active' && active) void syncPushSession(accountId).catch(() => undefined);
    });
    return () => { active = false; detach?.(); listener.remove(); void stopPushSession(); };
  }, [user?.id]);
  return null;
}
