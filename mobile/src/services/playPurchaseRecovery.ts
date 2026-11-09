import type { Purchase } from 'expo-iap';
import type { AiSubscriptionStatus } from '@/services/api/aiUsageService';

export const ACCOUNT_PURCHASE_CONFLICT = 'Gói trên tài khoản Google Play này đã gắn với tài khoản Fitmate khác. Hãy đăng nhập lại tài khoản Fitmate đã mua, hoặc dùng tài khoản Google Play khác trước khi mua. Không cần thanh toán lại.';
export function isPurchaseAccountConflict(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') return false;
  const error = cause as { status?: number; data?: { code?: string }; message?: string };
  return error.data?.code === 'AI_SUBSCRIPTION_BOUND_TO_ACCOUNT' ||
    error.status === 409 && /tài khoản|giao dịch|gắn/i.test(error.message ?? '');
}
export async function recoverPlayPurchases(
  purchases: Purchase[], productId: string, verify: (token: string) => Promise<AiSubscriptionStatus>,
  sessionIsCurrent: () => boolean,
): Promise<{ restored: boolean; conflict: boolean; pending: boolean }> {
  let restored = false; let conflict = false; let pending = false;
  const tokens = new Set<string>();
  for (const purchase of purchases) {
    if (!sessionIsCurrent()) throw new Error('Phiên đăng nhập đã thay đổi. Hãy mở lại Gói AI của tôi.');
    if (purchase.productId !== productId || !purchase.purchaseToken || tokens.has(purchase.purchaseToken)) continue;
    tokens.add(purchase.purchaseToken);
    if (purchase.purchaseState !== 'purchased') { pending = true; continue; }
    try {
      const status = await verify(purchase.purchaseToken);
      if (!sessionIsCurrent()) throw new Error('Phiên đăng nhập đã thay đổi. Hãy mở lại Gói AI của tôi.');
      restored = status.plan === 'plus' || restored;
    } catch (cause) {
      // A foreign token does not prevent restoring another valid token owned by this account.
      if (isPurchaseAccountConflict(cause)) { conflict = true; continue; }
      throw cause;
    }
  }
  return { restored, conflict, pending };
}
