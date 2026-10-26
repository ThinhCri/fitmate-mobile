import { apiClient } from './client';

export interface FeatureCapabilityStatus {
  enabled: boolean;
  status?: string;
  reason?: string;
}

export interface SystemCapabilities {
  api_version: string;
  environment: string;
  ai: {
    enabled: boolean;
    food_scan: boolean;
    companion_chat: boolean;
    workout_adjust: boolean;
    status_reason?: string;
  };
  vip_purchase: FeatureCapabilityStatus;
  reward_cashout: FeatureCapabilityStatus;
  pt_automatic_payout: FeatureCapabilityStatus;
  push_notifications_enabled: boolean;
  payments_enabled: boolean;
  storage_provider: string;
  policies?: {
    privacy_policy_url?: string;
    terms_of_service_url?: string;
    account_deletion_url?: string;
  };
  contact?: {
    support_email?: string;
    hotline?: string;
    terms_url?: string;
    privacy_url?: string;
    deletion_policy_url?: string;
  };
}

let cachedCapabilities: SystemCapabilities | null = null;
let cachedAt = 0;

export const systemService = {
  async getCapabilities(): Promise<SystemCapabilities> {
    if (cachedCapabilities && Date.now() - cachedAt < 60_000) {
      return cachedCapabilities;
    }

    try {
      const data = await apiClient<SystemCapabilities>('/system/capabilities', {
        method: 'GET',
      });
      cachedCapabilities = data;
      cachedAt = Date.now();
      return data;
    } catch {
      // Fail-closed fallback: disable gated features when server capabilities call fails
      return {
        api_version: '1.0.0',
        environment: 'production',
        ai: {
          enabled: false,
          food_scan: false,
          companion_chat: false,
          workout_adjust: false,
          status_reason: 'Không thể kết nối đến máy chủ để xác thực quyền năng',
        },
        vip_purchase: { enabled: false, reason: 'Tính năng tạm khóa' },
        reward_cashout: { enabled: false, reason: 'Tính năng tạm khóa' },
        pt_automatic_payout: { enabled: false, reason: 'Tính năng tạm khóa' },
        push_notifications_enabled: false,
        payments_enabled: false,
        storage_provider: 'unverified',
      };
    }
  },

  clearCache() {
    cachedCapabilities = null;
    cachedAt = 0;
  },
};
