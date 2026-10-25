import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ platform: { OS: 'android', Version: 33 }, check: vi.fn(), camera: vi.fn() }));
vi.mock('react-native', () => ({ Platform: mocks.platform,
  PermissionsAndroid: { check: mocks.check, PERMISSIONS: { POST_NOTIFICATIONS: 'notifications' } } }));
vi.mock('expo-image-picker', () => ({ getCameraPermissionsAsync: mocks.camera }));
import { readSettingsPermissions } from '../settingsPermissions';

describe('read-only device permission status', () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.platform.Version = 33; });
  it('reads granted notification and camera permissions', async () => {
    mocks.check.mockResolvedValue(true); mocks.camera.mockResolvedValue({ granted: true });
    expect(await readSettingsPermissions()).toEqual({ notifications: 'enabled', camera: 'enabled' });
  });
  it('reads disabled permissions without requesting them', async () => {
    mocks.check.mockResolvedValue(false); mocks.camera.mockResolvedValue({ granted: false });
    expect(await readSettingsPermissions()).toEqual({ notifications: 'disabled', camera: 'disabled' });
  });
  it('does not assume notification settings on pre-33 Android', async () => {
    mocks.platform.Version = 32; mocks.camera.mockResolvedValue({ granted: true });
    expect(await readSettingsPermissions()).toEqual({ notifications: 'unknown', camera: 'enabled' });
    expect(mocks.check).not.toHaveBeenCalled();
  });
  it('keeps read failures unknown instead of claiming off', async () => {
    mocks.check.mockRejectedValue(new Error('unavailable')); mocks.camera.mockRejectedValue(new Error('unavailable'));
    expect(await readSettingsPermissions()).toEqual({ notifications: 'unknown', camera: 'unknown' });
  });
});
