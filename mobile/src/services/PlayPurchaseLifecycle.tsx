import { useEffect } from 'react';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { sessionManager } from './session/sessionManager';
import { aiSubscriptionService } from './api/aiUsageService';
import { recoverAiPlanPurchases } from './playPurchaseRecovery';
import { notifyAiPlanChanged } from './aiPlanState';

// Recover paid purchases after process death/network loss before the original callback.
// No checkout is opened here and a purchase never moves between Fitmate accounts.
export function PlayPurchaseLifecycle() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user || Platform.OS !== 'android' || Constants.appOwnership === 'expo') return;
    const generation = sessionManager.getGeneration();
    let active = true; let busy = false; let attempts = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const current = () => active && generation === sessionManager.getGeneration();
    const recover = async () => {
      if (!current() || busy || AppState.currentState !== 'active') return;
      busy = true;
      try {
        const status = await aiSubscriptionService.getStatus();
        if (!current() || !status.restore_available) return;
        const play = await import('expo-iap');
        if (!current()) return;
        // Native connection belongs to the app; do not tear down another screen's checkout.
        await play.initConnection();
        if (!current()) return;
        const purchases = await play.getAvailablePurchases();
        const result = await recoverAiPlanPurchases(purchases, status, aiSubscriptionService.verify, aiSubscriptionService.verifyPurchase, current);
        if (current() && result.restored) notifyAiPlanChanged(user.id);
        attempts = 0;
      } catch {
        // A temporary network failure gets bounded background retries; explicit restore
        // still shows errors on the AI plan screen. Never log purchase tokens.
        if (current() && attempts++ < 3) retry = setTimeout(() => void recover(), 30_000);
      } finally { busy = false; }
    };
    void recover();
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') { if (retry) clearTimeout(retry); attempts = 0; void recover(); }
    });
    return () => { active = false; if (retry) clearTimeout(retry); listener.remove(); };
  }, [user?.id]);
  return null;
}
