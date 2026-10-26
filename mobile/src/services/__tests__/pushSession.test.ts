import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  permission: vi.fn(), capabilities: vi.fn(), api: vi.fn(), getToken: vi.fn(), deleteToken: vi.fn(), setAutoInitEnabled: vi.fn(),
  onTokenRefresh: vi.fn(), generation: 1,
}));
vi.mock('react-native', () => ({ Platform: { OS: 'android', Version: 35 }, PermissionsAndroid: { check: mocks.permission, PERMISSIONS: { POST_NOTIFICATIONS: 'notifications' } } }));
vi.mock('@/services/api/client', () => ({ apiClient: mocks.api }));
vi.mock('@/services/api/baseUrl', () => ({ getApiBaseUrl: () => 'https://example.test/api/v1' }));
vi.mock('@/services/api/systemService', () => ({ systemService: { getCapabilities: mocks.capabilities } }));
vi.mock('@/services/session/sessionManager', () => ({ sessionManager: { getGeneration: () => mocks.generation, getAccessToken: () => 'captured-credential' } }));
vi.mock('@react-native-firebase/messaging', () => ({ getMessaging: () => ({}), getToken: mocks.getToken, deleteToken: mocks.deleteToken, setAutoInitEnabled: mocks.setAutoInitEnabled, onTokenRefresh: mocks.onTokenRefresh }));

describe('native push ownership lifecycle', () => {
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks(); mocks.generation = 1;
    mocks.permission.mockResolvedValue(true); mocks.capabilities.mockResolvedValue({ push_notifications_enabled: true });
    mocks.getToken.mockResolvedValue('native-fcm-token'); mocks.deleteToken.mockResolvedValue(undefined);
    mocks.setAutoInitEnabled.mockResolvedValue(undefined); mocks.onTokenRefresh.mockReturnValue(() => undefined);
    mocks.api.mockResolvedValue({ device_id: 'device-id' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });
  it('does not register tokens without OS permission', async () => {
    mocks.permission.mockResolvedValue(false);
    const push = await import('../pushSession'); await push.syncPushSession('owner');
    expect(mocks.api).not.toHaveBeenCalled(); expect(mocks.getToken).not.toHaveBeenCalled();
  });
  it('does not register against an unconfigured backend', async () => {
    mocks.capabilities.mockResolvedValue({ push_notifications_enabled: false });
    const push = await import('../pushSession'); await push.syncPushSession('owner');
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it('registers the native token and invalidates it on logout with captured credentials', async () => {
    const push = await import('../pushSession'); await push.syncPushSession('owner');
    expect(push.currentPushOwner()).toBe('owner');
    expect(mocks.api).toHaveBeenCalledWith('/users/me/devices', expect.objectContaining({ method: 'POST', body: JSON.stringify({ deviceToken: 'native-fcm-token', platform: 'android', provider: 'fcm' }) }));
    const stopped = push.stopPushSession('logout-snapshot'); expect(push.currentPushOwner()).toBeNull(); await stopped;
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://example.test/api/v1/users/me/devices/device-id', expect.objectContaining({ method: 'DELETE', headers: { Authorization: 'Bearer logout-snapshot' } }));
  });
  it('does not attach a late token result after session invalidation', async () => {
    let resolve!: (value: string) => void;
    mocks.getToken.mockReturnValue(new Promise<string>(done => { resolve = done; }));
    const push = await import('../pushSession'); const registering = push.syncPushSession('old-owner');
    await vi.waitFor(() => expect(mocks.getToken).toHaveBeenCalled());
    const stopping = push.stopPushSession(); resolve('late-token'); await registering; await stopping;
    expect(mocks.api).not.toHaveBeenCalled(); expect(push.currentPushOwner()).toBeNull();
  });
});
