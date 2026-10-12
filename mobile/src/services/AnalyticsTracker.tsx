import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { syncAnalyticsUser, trackAnalyticsScreen } from '@/services/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  useEffect(() => {
    let cancelled = false;
    void syncAnalyticsUser(user?.id ?? null).then(() => {
      if (!cancelled) return trackAnalyticsScreen(pathname);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, pathname]);
  return null;
}
