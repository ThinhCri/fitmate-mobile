import { apiClient } from './client';

export interface AiUsageItem {
  limit: number;
  used: number;
  remaining: number;
}

export interface AiUsageStatus {
  plan: 'free' | 'plus';
  enforcement_enabled: boolean;
  resets_at_utc: string;
  chat: AiUsageItem;
  scan: AiUsageItem;
}

export const aiUsageService = {
  getStatus: () => apiClient<AiUsageStatus>('/me/ai-usage'),
};

export interface AiSubscriptionStatus {
  plan: 'free' | 'plus';
  billing_available: boolean;
  restore_available: boolean;
  product_id: string;
  base_plan_id: string;
  state: string;
  expires_at_utc: string | null;
  billing_account_id?: string | null;
  purchase_type?: 'in-app' | 'subs';
  legacy_product_id?: string | null;
}

export const aiSubscriptionService = {
  getStatus: () => apiClient<AiSubscriptionStatus>('/me/ai-subscription'),
  verifyPurchase: (purchaseToken: string) => apiClient<AiSubscriptionStatus>('/me/ai-subscription/verify-purchase', {
    method: 'POST',
    headers: { 'Idempotency-Key': 'aiProduct_' + Date.now() + '_' + Math.floor(Math.random() * 1_000_000_000_000) },
    body: JSON.stringify({ purchase_token: purchaseToken }),
  }),
  verify: (purchaseToken: string) => apiClient<AiSubscriptionStatus>('/me/ai-subscription/verify', {
    method: 'POST',
    headers: { 'Idempotency-Key': `aiVerify_${Date.now()}_${Math.floor(Math.random() * 1_000_000_000_000)}` },
    body: JSON.stringify({ purchase_token: purchaseToken }),
  }),
};
