import { describe, expect, it, vi } from 'vitest';
import type { Purchase } from 'expo-iap';
import type { AiSubscriptionStatus } from '@/services/api/aiUsageService';
import { checkoutBillingAccountId, recoverPlayPurchases, recoverAiPlanPurchases } from '../playPurchaseRecovery';
const purchase = (token: string, state = 'purchased') => ({ productId: 'fitmate_ai_plus', purchaseToken: token, purchaseState: state }) as Purchase;
const plus = { plan: 'plus' } as AiSubscriptionStatus;
describe('Play purchase recovery ownership', () => {
  it('routes one-time and legacy purchases to their own real API adapters', async () => {
    const legacy = vi.fn().mockResolvedValue(plus); const product = vi.fn().mockResolvedValue(plus);
    const status = { product_id: 'fitmate_ai_plus_month', legacy_product_id: 'fitmate_ai_plus', purchase_type: 'in-app' } as AiSubscriptionStatus;
    const current = { ...purchase('new'), productId: status.product_id } as Purchase;
    const result = await recoverAiPlanPurchases([current, purchase('old')], status, legacy, product, () => true);
    expect(result.restored).toBe(true); expect(product).toHaveBeenCalledWith('new');
    expect(legacy).toHaveBeenCalledWith('old'); expect(legacy).not.toHaveBeenCalledWith('new');
  });
  it('does not require consumed Play inventory to keep an account entitlement', async () => {
    const verify = vi.fn();
    const result = await recoverAiPlanPurchases([], { product_id: 'fitmate_ai_plus_month', purchase_type: 'in-app' } as AiSubscriptionStatus, verify, verify, () => true);
    expect(result.restored).toBe(false); expect(verify).not.toHaveBeenCalled();
    // This helper never writes free/expiry; the plan page separately reads the server ledger.
  });
  it('requires a server-issued opaque Fitmate binding before a new checkout', () => {
    expect(checkoutBillingAccountId('a'.repeat(64))).toBe('a'.repeat(64));
    for (const invalid of [undefined, null, '', 'buyer@example.test', 'previous-user', 'a'.repeat(63)])
      expect(() => checkoutBillingAccountId(invalid)).toThrow('Chưa xác định được tài khoản nhận gói');
  });
  it('finds the current account purchase even if a foreign purchase appears first', async () => {
    const verify = vi.fn(async (token: string) => { if (token === 'foreign') throw { status: 409, data: { code: 'AI_SUBSCRIPTION_BOUND_TO_ACCOUNT' } }; return plus; });
    expect(await recoverPlayPurchases([purchase('foreign'), purchase('mine')], 'fitmate_ai_plus', verify, () => true)).toEqual({ restored: true, conflict: true, pending: false });
    expect(verify).toHaveBeenCalledTimes(2);
  });
  it('reports foreign ownership before checkout without transferring it', async () => {
    const verify = vi.fn().mockRejectedValue({ status: 409, data: { code: 'AI_SUBSCRIPTION_BOUND_TO_ACCOUNT' } });
    expect((await recoverPlayPurchases([purchase('foreign')], 'fitmate_ai_plus', verify, () => true)).conflict).toBe(true);
  });
  it('rejects stale login sessions and never verifies against another account', async () => {
    const verify = vi.fn();
    await expect(recoverPlayPurchases([purchase('mine')], 'fitmate_ai_plus', verify, () => false)).rejects.toThrow('Phiên đăng nhập');
    expect(verify).not.toHaveBeenCalled();
  });
  it('does not verify pending purchases and deduplicates restored tokens', async () => {
    const verify = vi.fn().mockResolvedValue(plus);
    const result = await recoverPlayPurchases([purchase('pending', 'pending'), purchase('mine'), purchase('mine')], 'fitmate_ai_plus', verify, () => true);
    expect(result).toEqual({ restored: true, conflict: false, pending: true }); expect(verify).toHaveBeenCalledTimes(1);
  });
  it('fails closed on provider errors instead of allowing another charge', async () => {
    await expect(recoverPlayPurchases([purchase('mine')], 'fitmate_ai_plus', vi.fn().mockRejectedValue(new Error('Provider unavailable')), () => true)).rejects.toThrow('Provider unavailable');
  });
});
