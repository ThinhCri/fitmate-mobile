import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  values: new Map<string, string>(),
  enabled: vi.fn(), reset: vi.fn(), consent: vi.fn(), event: vi.fn(),
  getAnalytics: vi.fn(),
}));
vi.mock('@react-native-async-storage/async-storage', () => ({ default: {
  getItem: vi.fn(async (key: string) => mocks.values.get(key) ?? null),
  setItem: vi.fn(async (key: string, value: string) => { mocks.values.set(key, value); }),
} }));
vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));
vi.mock('expo-constants', () => ({ default: {
  appOwnership: 'standalone', expoConfig: { extra: { firebaseAnalyticsEnabled: true } },
} }));
vi.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: mocks.getAnalytics,
  setAnalyticsCollectionEnabled: (_native: unknown, enabled: boolean) => mocks.enabled(enabled),
  resetAnalyticsData: () => mocks.reset(),
  setConsent: (_native: unknown, value: unknown) => mocks.consent(value),
  logEvent: (_native: unknown, name: string, params: unknown) => mocks.event(name, params),
}));

describe('Android analytics consent', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.values.clear();
    mocks.getAnalytics.mockImplementation(() => ({}));
  });

  it('distinguishes an unanswered prompt from a remembered refusal', async () => {
    const service = await import('../analytics');
    expect(await service.getAnalyticsConsentChoice('a')).toBeNull();
    await service.updateAnalyticsConsent('a', false);
    expect(await service.getAnalyticsConsentChoice('a')).toBe(false);
    expect(await service.getAnalyticsConsentChoice('b')).toBeNull();
  });

  it('does not collect or log screens before explicit consent', async () => {
    const service = await import('../analytics');
    await service.syncAnalyticsUser('a');
    await service.trackAnalyticsScreen('/dashboard');
    expect(mocks.enabled).not.toHaveBeenCalledWith(true);
    expect(mocks.event).not.toHaveBeenCalled();
    expect(mocks.reset).not.toHaveBeenCalled();
  });

  it('enables collection only after agreement and sends only allowlisted screen names', async () => {
    const service = await import('../analytics');
    await service.syncAnalyticsUser('a');
    await service.updateAnalyticsConsent('a', true);
    await service.trackAnalyticsScreen('/workout/private-plan-id?health=sensitive');
    await service.trackAnalyticsScreen('/unknown/private');
    expect(mocks.enabled).toHaveBeenLastCalledWith(true);
    expect(mocks.consent).toHaveBeenLastCalledWith({
      analytics_storage: true, ad_storage: false, ad_user_data: false, ad_personalization: false,
    });
    expect(mocks.event).toHaveBeenCalledTimes(1);
    expect(mocks.event).toHaveBeenCalledWith('screen_view', { screen_name: 'workout' });
  });

  it('stops screens on refusal and does not inherit consent when switching accounts', async () => {
    const service = await import('../analytics');
    await service.syncAnalyticsUser('a');
    await service.updateAnalyticsConsent('a', true);
    await service.updateAnalyticsConsent('a', false);
    await service.trackAnalyticsScreen('/dashboard');
    expect(mocks.enabled).toHaveBeenLastCalledWith(false);
    expect(mocks.event).not.toHaveBeenCalled();
    await service.syncAnalyticsUser('b');
    expect(mocks.reset).toHaveBeenCalledTimes(1);
    expect(await service.getAnalyticsConsentChoice('b')).toBeNull();
    expect(mocks.enabled).toHaveBeenLastCalledWith(false);
  });

  it('preserves the app instance across cold starts with saved consent', async () => {
    mocks.values.set('fitmate:analytics-consent:a', 'true');
    const service = await import('../analytics');
    await service.syncAnalyticsUser('a');
    await service.syncAnalyticsUser('a');
    expect(mocks.reset).not.toHaveBeenCalled();
    expect(mocks.enabled).toHaveBeenLastCalledWith(true);
  });

  it('reports an unavailable native SDK rather than claiming collection is enabled', async () => {
    const service = await import('../analytics');
    await service.syncAnalyticsUser('a');
    mocks.getAnalytics.mockImplementation(() => { throw new Error('Native SDK missing'); });
    await expect(service.updateAnalyticsConsent('a', true)).rejects.toThrow('not available');
    await service.trackAnalyticsScreen('/dashboard');
    expect(mocks.event).not.toHaveBeenCalled();
  });

  it('does not let a superseded account sync enable collection after logout', async () => {
    mocks.values.set('fitmate:analytics-consent:a', 'true');
    const service = await import('../analytics');
    await Promise.all([service.syncAnalyticsUser('a'), service.syncAnalyticsUser(null)]);
    await service.trackAnalyticsScreen('/dashboard');
    expect(mocks.enabled).toHaveBeenLastCalledWith(false);
    expect(mocks.event).not.toHaveBeenCalled();
  });
});
