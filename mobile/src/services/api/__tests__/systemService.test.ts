import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { systemService } from '../systemService';

describe('System Capabilities & Production Gating (MOB-807)', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    global.fetch = originalFetch;
    systemService.clearCache();
    vi.restoreAllMocks();
  });

  it('fetches system capabilities from API in production mode', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        api_version: '1.0.0',
        environment: 'production',
        ai: {
          enabled: false,
          food_scan: false,
          companion_chat: false,
          workout_adjust: false,
          status_reason: 'AI capability runtime gated by BE-817',
        },
        vip_purchase: { enabled: false, reason: 'Chưa hỗ trợ mua VIP (BR-17)' },
        reward_cashout: { enabled: false, reason: 'Chưa hỗ trợ quy đổi thưởng (BR-17)' },
        pt_automatic_payout: { enabled: false, reason: 'Quy trình chi trả PT thủ công (BR-17)' },
        push_notifications_enabled: true,
        payments_enabled: true,
        storage_provider: 'digitalocean_spaces',
      }),
    });

    const caps = await systemService.getCapabilities();
    expect(caps.api_version).toBe('1.0.0');
    expect(caps.environment).toBe('production');
    expect(caps.ai.enabled).toBe(false);
    expect(caps.vip_purchase.enabled).toBe(false);
    expect(caps.reward_cashout.enabled).toBe(false);
    expect(caps.pt_automatic_payout.enabled).toBe(false);
  });

  it('fails closed and disables gated features when API fails', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Server Error' }),
    });

    const caps = await systemService.getCapabilities();
    expect(caps.ai.enabled).toBe(false);
    expect(caps.vip_purchase.enabled).toBe(false);
    expect(caps.reward_cashout.enabled).toBe(false);
    expect(caps.pt_automatic_payout.enabled).toBe(false);
    expect(caps.payments_enabled).toBe(false);
  });

  it('returns isolated capabilities in preview mode without calling fetch', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const caps = await systemService.getCapabilities();
    expect(caps.environment).toBe('preview');
    expect(caps.ai.enabled).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
