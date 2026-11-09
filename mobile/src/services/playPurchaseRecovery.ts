import type { Purchase } from 'expo-iap';
import type { AiSubscriptionStatus } from '@/services/api/aiUsageService';

export const ACCOUNT_PURCHASE_CONFLICT = 'Google Play vẫn trả về gói thuộc tài khoản Fitmate khác. Chưa mở thanh toán mới để tránh mua nhầm. Xem cách đổi tài khoản thanh toán bên dưới; không cần xóa tài khoản Google khỏi điện thoại.';

export function checkoutBillingAccountId(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
    throw new Error('Chưa xác định được tài khoản nhận gói. Vui lòng tải lại trang trước khi mua.');
  return value;
}
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

export async function recoverAiPlanPurchases(
  purchases: Purchase[], status: AiSubscriptionStatus,
  legacyVerify: (token: string) => Promise<AiSubscriptionStatus>,
  productVerify: (token: string) => Promise<AiSubscriptionStatus>, current: () => boolean,
) {
  const result = await recoverPlayPurchases(purchases, status.product_id,
    status.purchase_type === 'in-app' ? productVerify : legacyVerify, current);
  if (!status.legacy_product_id || status.legacy_product_id === status.product_id) return result;
  const legacy = await recoverPlayPurchases(purchases, status.legacy_product_id, legacyVerify, current);
  return { restored: result.restored || legacy.restored,
    conflict: result.conflict || legacy.conflict, pending: result.pending || legacy.pending };
}
