import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { IAccountRepository, AccountDeletionStatusViewModel } from '../accountRepository';
import { authService } from '@/services/api/authService';
import { apiClient } from '@/services/api/client';

export class ApiAccountRepository implements IAccountRepository {
  async getAccountHub(): Promise<AccountHubViewModel> {
    const me = await authService.getMe();
    return {
      id: me.id,
      name: me.full_name || 'Người dùng',
      email: me.email,
      role: me.specialty || me.certificate_status ? 'pt' : 'member',
      avatarUrl: me.avatar_url ?? undefined,
    };
  }

  async getHealthProfile(): Promise<HealthProfileData> {
    const me = await authService.getMe();
    return {
      medicalConditions: '',
      hasNoMedicalConditions: false,
      allergies: '',
      hasNoAllergies: false,
      workoutDays: me.training_days || [],
      preferredTimeSlots: [],
      notes: '',
    };
  }

  async updateProfile(data: UserProfileFormData): Promise<void> {
    await apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: data.name,
        phone: data.phone,
        birthday: data.birthday,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        fitness_goal: data.fitnessGoal,
      }),
    });
  }

  async updateHealthProfile(data: HealthProfileData): Promise<void> {
    await apiClient('/users/me/health', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 12 || newPassword.length > 128) {
      throw new Error('Mật khẩu mới phải có độ dài từ 12 đến 128 ký tự');
    }
    await apiClient('/auth/password/change', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async getSettings(): Promise<SettingsViewModel> {
    return {
      notificationsEnabled: true,
      emailAlertsEnabled: true,
      language: 'vi',
      appVersion: '1.0.0',
    };
  }

  async requestAccountDeletion(reason?: string): Promise<AccountDeletionStatusViewModel> {
    const res = await apiClient<any>('/users/me/delete-request', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return {
      userId: res.user_id,
      status: res.status,
      isPendingDeletion: Boolean(res.is_pending_deletion),
      requestedAt: res.requested_at,
      scheduledPermanentDeletionAt: res.scheduled_permanent_deletion_at,
      retentionDaysRemaining: res.retention_days_remaining ?? 30,
      hasActiveBookings: Boolean(res.has_active_bookings),
    };
  }

  async getDeletionStatus(): Promise<AccountDeletionStatusViewModel> {
    const res = await apiClient<any>('/users/me/deletion-status', {
      method: 'GET',
    });
    return {
      userId: res.user_id,
      status: res.status,
      isPendingDeletion: Boolean(res.is_pending_deletion),
      requestedAt: res.requested_at,
      scheduledPermanentDeletionAt: res.scheduled_permanent_deletion_at,
      retentionDaysRemaining: res.retention_days_remaining ?? 0,
      hasActiveBookings: Boolean(res.has_active_bookings),
    };
  }

  async cancelAccountDeletion(): Promise<AccountDeletionStatusViewModel> {
    const res = await apiClient<any>('/users/me/cancel-deletion', {
      method: 'POST',
    });
    return {
      userId: res.user_id,
      status: res.status,
      isPendingDeletion: Boolean(res.is_pending_deletion),
      requestedAt: res.requested_at,
      scheduledPermanentDeletionAt: res.scheduled_permanent_deletion_at,
      retentionDaysRemaining: res.retention_days_remaining ?? 0,
      hasActiveBookings: Boolean(res.has_active_bookings),
    };
  }

  async exportUserData(): Promise<{ downloadUrl?: string; requestedAt?: string }> {
    const res = await apiClient<any>('/users/me/export', {
      method: 'POST',
    });
    return {
      downloadUrl: res.download_url || res.url,
      requestedAt: res.requested_at || new Date().toISOString(),
    };
  }
}

export const apiAccountRepository = new ApiAccountRepository();
