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
  async getProfile(): Promise<UserProfileFormData> {
    const me = await authService.getMe();
    return {
      name: me.full_name,
      bio: '',
      phone: me.phone || '',
      gender: me.gender || 'other',
      birthday: me.birthday || '',
      heightCm: me.height_cm ?? 0,
      weightKg: me.weight_kg ?? 0,
      fitnessGoal: me.fitness_goal || '',
    };
  }
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
      medicalConditions: (me.medical_conditions || []).join(', '),
      hasNoMedicalConditions: (me.medical_conditions || []).length === 0,
      allergies: (me.allergies || []).join(', '),
      hasNoAllergies: (me.allergies || []).length === 0,
      workoutDays: me.training_days || [],
      preferredTimeSlots: [],
      notes: '',
    };
  }

  async updateProfile(data: UserProfileFormData): Promise<void> {
    const current = await authService.getMe();
    if ((data.bio && data.bio.trim()) || data.gender !== (current.gender || 'other') || data.birthday !== (current.birthday || '')) {
      throw new Error('Máy chủ hiện chưa hỗ trợ cập nhật tiểu sử, giới tính hoặc ngày sinh. Các trường khác chưa được lưu.');
    }
    await apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: data.name,
        phone: data.phone,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        fitness_goal: data.fitnessGoal,
      }),
    });
  }

  async updateHealthProfile(data: HealthProfileData): Promise<void> {
    if (data.preferredTimeSlots.length > 0 || data.notes.trim().length > 0) {
      throw new Error('Máy chủ hiện chưa hỗ trợ lưu khung giờ ưu tiên hoặc ghi chú sức khỏe.');
    }
    await apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        medical_conditions: data.hasNoMedicalConditions ? [] : data.medicalConditions.split(',').map((value) => value.trim()).filter(Boolean),
        allergies: data.hasNoAllergies ? [] : data.allergies.split(',').map((value) => value.trim()).filter(Boolean),
        training_days: data.workoutDays,
      }),
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
      requestedAt: res.requested_at,
    };
  }
}

export const apiAccountRepository = new ApiAccountRepository();
