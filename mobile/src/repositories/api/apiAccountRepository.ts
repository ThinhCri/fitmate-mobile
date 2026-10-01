import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { IAccountRepository } from '../accountRepository';
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
}

export const apiAccountRepository = new ApiAccountRepository();
