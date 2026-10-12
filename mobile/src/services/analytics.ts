import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const consentKey = (userId: string) => `fitmate:analytics-consent:${userId}`;
let currentUserId: string | null = null;
let collectionEnabled = false;
let sequence = 0;

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
  return (await AsyncStorage.getItem(consentKey(userId))) === 'true';
}

export function isAnalyticsAvailable(): boolean {
  return nativeReady();
}

export async function syncAnalyticsUser(userId: string | null): Promise<void> {
  const ticket = ++sequence;
  if (currentUserId !== userId) {
    currentUserId = userId;
    collectionEnabled = false;
    const native = await nativeAnalytics();
    if (ticket !== sequence) return;
    if (native) {
      await native.setAnalyticsCollectionEnabled(false);
      await native.resetAnalyticsData();
    }
  }
  if (!userId) return;
  const consent = await getAnalyticsConsent(userId);
  if (ticket !== sequence) return;
  const native = await nativeAnalytics();
  if (ticket !== sequence || !native) return;
  await native.setConsent({
    analytics_storage: consent,
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
  });
  await native.setAnalyticsCollectionEnabled(consent);
  collectionEnabled = consent;
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
