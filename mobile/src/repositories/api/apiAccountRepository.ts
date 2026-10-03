import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { IAccountRepository, AccountDeletionStatusViewModel } from '../accountRepository';
import { authService } from '@/services/api/authService';
import { apiClient, apiUploadFile, resolveApiResourceUrl } from '@/services/api/client';
import Constants from 'expo-constants';
import { bookingService } from '@/services/api/bookingService';
import { apiSocialRepository } from './apiSocialRepository';
import { apiSupportRepository } from './apiSupportRepository';
import { systemService } from '@/services/api/systemService';

export class ApiAccountRepository implements IAccountRepository {
  async getProfile(): Promise<UserProfileFormData> {
    const me = await authService.getMe();
    return {
      name: me.full_name,
      avatarUrl: me.avatar_url || undefined,
      bio: me.bio || '',
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
    const [bookings, social, conversations, notifications] = await Promise.all([
      (me.role === 'pt' ? bookingService.listMyTrainerBookings({ page: 1, pageSize: 100 }) : bookingService.listMyBookings({ page: 1, pageSize: 100 })).catch(() => ({ items: [] } as any)),
      apiSocialRepository.getFriends().catch(() => ({ friends: [], pendingRequests: [], sentRequests: [], discoverUsers: [] })),
      apiSocialRepository.listConversations().catch(() => []),
      apiSupportRepository.getNotifications().catch(() => []),
    ]);
    return {
      id: me.id,
      name: me.full_name || 'Người dùng',
      email: me.email,
      role: me.role === 'pt' ? 'pt' : 'member',
      avatarUrl: me.avatar_url ?? undefined,
      upcomingBookingCount: (bookings.items || []).filter((item: any) => !['Completed', 'Cancelled', 'Rejected', 'Expired'].includes(item.status)).length,
      friendCount: social.friends.length,
      unreadChatCount: conversations.reduce((sum, item) => sum + item.unreadCount, 0),
      unreadNotifCount: notifications.filter((item) => !item.isRead).length,
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
      preferredTimeSlots: me.preferred_time_slots || [],
      notes: me.health_notes || '',
    };
  }

  async updateProfile(data: UserProfileFormData): Promise<void> {
    await apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: data.name,
        bio: data.bio,
        phone: data.phone,
        gender: data.gender,
        birthday: data.birthday || null,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        fitness_goal: data.fitnessGoal,
      }),
    });
  }

  async updateAvatar(image: { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number }): Promise<string> {
    const mimeType = image.mimeType?.toLowerCase() || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      throw new Error('Ảnh đại diện phải có định dạng JPG, PNG hoặc WebP.');
    }
    if (image.fileSize && image.fileSize > 5 * 1024 * 1024) {
      throw new Error('Ảnh đại diện không được lớn hơn 5 MB.');
    }

    const extension = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
    const originalName = image.fileName?.trim();
    const fileName = originalName && /\.(jpe?g|png|webp)$/i.test(originalName)
      ? originalName
      : `avatar${extension}`;
    const upload = await apiUploadFile<{ storageKey?: string; uri?: string; signedUrl?: string }>(
      '/uploads',
      image.uri,
      mimeType,
      { category: 'avatars', fileName }
    );
    if (!upload.storageKey) throw new Error('Máy chủ không trả về mã lưu trữ ảnh đại diện.');
    const profile = await apiClient<{ avatar_url?: string | null }>('/users/me/avatar', {
      method: 'PUT',
      body: JSON.stringify({ storage_key: upload.storageKey }),
    });
    if (!profile.avatar_url) throw new Error('Máy chủ không trả về địa chỉ ảnh đại diện.');
    return resolveApiResourceUrl(profile.avatar_url);
  }

  async updateHealthProfile(data: HealthProfileData): Promise<void> {
    await apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        medical_conditions: data.hasNoMedicalConditions ? [] : data.medicalConditions.split(',').map((value) => value.trim()).filter(Boolean),
        allergies: data.hasNoAllergies ? [] : data.allergies.split(',').map((value) => value.trim()).filter(Boolean),
        training_days: data.workoutDays,
        preferred_time_slots: data.preferredTimeSlots,
        health_notes: data.notes,
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
    const [preference, capabilities] = await Promise.all([
      apiClient<any>('/users/me/preferences'),
      systemService.getCapabilities(),
    ]);
    return {
      notificationsEnabled: Boolean(preference.notifications_enabled),
      emailAlertsEnabled: Boolean(preference.email_notifications),
      pushNotificationsEnabled: Boolean(preference.push_notifications),
      language: preference.language || 'vi',
      theme: preference.theme || 'light',
      appVersion: `${Constants.expoConfig?.version || '0.1.0'}${Constants.nativeBuildVersion ? ` (${Constants.nativeBuildVersion})` : ''}`,
      termsUrl: capabilities.contact?.terms_url,
      privacyUrl: capabilities.contact?.privacy_url,
    };
  }

  async updateSettings(values: Partial<Pick<SettingsViewModel, 'notificationsEnabled' | 'emailAlertsEnabled' | 'pushNotificationsEnabled' | 'language' | 'theme'>>): Promise<SettingsViewModel> {
    await apiClient('/users/me/preferences', { method: 'PUT', body: JSON.stringify({
      notifications_enabled: values.notificationsEnabled,
      email_notifications: values.emailAlertsEnabled,
      push_notifications: values.pushNotificationsEnabled,
      language: values.language,
      theme: values.theme,
    }) });
    return this.getSettings();
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

  async exportUserData(): Promise<{ downloadUrl?: string; requestedAt?: string; data?: unknown }> {
    const res = await apiClient<any>('/users/me/export', {
      method: 'POST',
    });
    return {
      downloadUrl: res.download_url || res.url,
      requestedAt: res.requested_at,
      data: res,
    };
  }
}

export const apiAccountRepository = new ApiAccountRepository();
