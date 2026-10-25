import { useEffect, useState } from 'react';
import { usePathname } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { getAnalyticsConsentChoice, isAnalyticsAvailable, syncAnalyticsUser, trackAnalyticsScreen, updateAnalyticsConsent } from '@/services/analytics';
import { AnalyticsConsentDialog } from './AnalyticsConsentDialog';
import { requestInitialPermissionsOnce } from './initialPermissions';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userId = user?.id;
  const userEmail = user?.email;
  const [promptUserId, setPromptUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setPromptUserId(null); setError(null); }, [user?.id]);
  useEffect(() => {
    let cancelled = false;
    if (!userId || !userEmail || !pathname.includes('dashboard') || !isAnalyticsAvailable()) return;
    const account = { id: userId, email: userEmail };
    void (async () => {
      // Share the existing permission onboarding promise; don't stack dialogs.
      await requestInitialPermissionsOnce(account.email).catch(() => {});
      const choice = await getAnalyticsConsentChoice(account.id);
      if (!cancelled && choice === null) { setError(null); setPromptUserId(account.id); }
    })().catch(() => {}); // Fail closed; settings still allows a later choice.
    return () => { cancelled = true; };
  }, [userId, userEmail, pathname]);
  useEffect(() => {
    let cancelled = false;
    void syncAnalyticsUser(user?.id ?? null).then(() => {
      if (!cancelled) return trackAnalyticsScreen(pathname);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, pathname]);
  const choose = async (enabled: boolean) => {
    if (busy || !user?.id || promptUserId !== user.id) return;
    setBusy(true);
    setError(null);
    try {
      await updateAnalyticsConsent(user.id, enabled);
      if (enabled) await trackAnalyticsScreen(pathname);
      setPromptUserId(null);
    } catch {
      setError('Không thể lưu lựa chọn. Vui lòng thử lại.');
    } finally { setBusy(false); }
  };
  return <AnalyticsConsentDialog visible={Boolean(user?.id && promptUserId === user.id)}
    busy={busy} error={error} onChoose={(enabled) => { void choose(enabled); }} />;
}
