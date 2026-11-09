import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ subscription: vi.fn(), usage: vi.fn() }));
vi.mock('../api/aiUsageService', () => ({ aiSubscriptionService: { getStatus: mock.subscription }, aiUsageService: { getStatus: mock.usage } }));
import { loadAiPlanState, notifyAiPlanChanged, subscribeAiPlanChanged } from '../aiPlanState';
beforeEach(() => { mock.subscription.mockReset(); mock.usage.mockReset(); });
describe('server account entitlement state', () => {
  it('loads purchased plan and expiry from backend without Play restore', async () => {
    mock.subscription.mockResolvedValue({ plan: 'plus', expires_at_utc: '2026-12-09T00:00:00Z' });
    mock.usage.mockResolvedValue({ plan: 'plus', chat: { limit: 100 } });
    const result = await loadAiPlanState();
    expect(result.subscription.expires_at_utc).toBe('2026-12-09T00:00:00Z');
    expect(result.usage.chat.limit).toBe(100);
  });
  it('refreshes stale subscription metadata after background recovery', async () => {
    mock.subscription.mockResolvedValueOnce({ plan: 'free' }).mockResolvedValueOnce({ plan: 'plus', expires_at_utc: '2026-12-09T00:00:00Z' });
    mock.usage.mockResolvedValue({ plan: 'plus' });
    expect((await loadAiPlanState()).subscription.plan).toBe('plus');
  });
  it('does not convert network failure or contradictory plans into free', async () => {
    mock.subscription.mockRejectedValueOnce(new Error('Network unavailable'));
    await expect(loadAiPlanState()).rejects.toThrow('Network unavailable');
    mock.subscription.mockResolvedValue({ plan: 'free' }); mock.usage.mockResolvedValue({ plan: 'plus' });
    await expect(loadAiPlanState()).rejects.toThrow('Gói AI vừa thay đổi');
  });
  it('identifies the changed account and detaches listeners on cleanup', () => {
    const listener = vi.fn(); const detach = subscribeAiPlanChanged(listener);
    notifyAiPlanChanged('account-b'); expect(listener).toHaveBeenCalledWith('account-b');
    detach(); notifyAiPlanChanged('account-a'); expect(listener).toHaveBeenCalledTimes(1);
  });
});
