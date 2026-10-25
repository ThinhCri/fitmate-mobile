import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const consentKey = (userId: string) => `fitmate:analytics-consent:${userId}`;
let currentUserId: string | null = null;
let collectionEnabled = false;
let sequence = 0;
let pendingSync: Promise<void> = Promise.resolve();

function nativeReady() {
  return Platform.OS === 'android' && Constants.appOwnership !== 'expo' &&
    Constants.expoConfig?.extra?.firebaseAnalyticsEnabled === true;
}

async function nativeAnalytics() {
  if (!nativeReady()) return null;
  try {
    const module = await import('@react-native-firebase/analytics');
    const analytics = module.getAnalytics();
    return {
      setAnalyticsCollectionEnabled: (enabled: boolean) => module.setAnalyticsCollectionEnabled(analytics, enabled),
      resetAnalyticsData: () => module.resetAnalyticsData(analytics),
      setConsent: (consent: Parameters<typeof module.setConsent>[1]) => module.setConsent(analytics, consent),
      logScreen: (screen: string) => module.logEvent(analytics, 'screen_view', { screen_name: screen }),
    };
  } catch {
    return null;
  }
}

export async function getAnalyticsConsent(userId: string): Promise<boolean> {
  return (await getAnalyticsConsentChoice(userId)) === true;
}

/** null means no decision yet; an explicit refusal must not trigger more prompts. */
export async function getAnalyticsConsentChoice(userId: string): Promise<boolean | null> {
  const value = await AsyncStorage.getItem(consentKey(userId));
  return value === 'true' ? true : value === 'false' ? false : null;
}

export function isAnalyticsAvailable(): boolean {
  return nativeReady();
}

export function syncAnalyticsUser(userId: string | null): Promise<void> {
  const ticket = ++sequence;
  collectionEnabled = false;
  // Serialize native mutations so a late consent operation cannot re-enable
  // collection after a logout/account switch has already disabled it.
  const next = pendingSync.catch(() => {}).then(() => applyAnalyticsUser(userId, ticket));
  pendingSync = next;
  return next;
}

async function applyAnalyticsUser(userId: string | null, ticket: number): Promise<void> {
  if (ticket !== sequence) return;
  if (currentUserId !== userId || userId === null) {
    const hadPreviousAccount = currentUserId !== null;
    currentUserId = userId;
    collectionEnabled = false;
    const native = await nativeAnalytics();
    if (ticket !== sequence) return;
    if (native) {
      await native.setAnalyticsCollectionEnabled(false);
      // Preserve the app-instance identity on cold starts. Reset only when
      // leaving/switching an authenticated account, not on every app launch.
      if (hadPreviousAccount) await native.resetAnalyticsData();
    }
  }
  if (!userId) return;
  const consent = await getAnalyticsConsent(userId);
  if (ticket !== sequence) return;
  const native = await nativeAnalytics();
  if (ticket !== sequence) return;
  if (!native) {
    if (consent) throw new Error('Analytics is not available in this build.');
    return;
  }
  await native.setConsent({
    analytics_storage: consent,
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
  });
  if (ticket !== sequence) return;
  await native.setAnalyticsCollectionEnabled(consent);
  if (ticket === sequence) collectionEnabled = consent;
}

export async function updateAnalyticsConsent(userId: string, enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(consentKey(userId), enabled ? 'true' : 'false');
  if (currentUserId === userId) await syncAnalyticsUser(userId);
}

const allowedScreens = new Set([
  'dashboard', 'nutrition', 'workout', 'social', 'marketplace',
  'account', 'community', 'chat', 'auth', 'trainer',
]);

export async function trackAnalyticsScreen(pathname: string): Promise<void> {
  if (!collectionEnabled) return;
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (!firstSegment || !allowedScreens.has(firstSegment)) return;
  const native = await nativeAnalytics();
  if (!native || !collectionEnabled) return;
  // Never send route parameters, names, messages, meal images or medical data.
  await native.logScreen(firstSegment);
}
