import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { IAccountRepository, AccountDeletionStatusViewModel } from '../accountRepository';

export class PreviewAccountRepository implements IAccountRepository {
  private settings: SettingsViewModel = { notificationsEnabled: true, emailAlertsEnabled: false, pushNotificationsEnabled: true, language: 'vi', theme: 'light', appVersion: '0.1.0-preview' };
  private profile: UserProfileFormData = {
    name: 'Nguyễn Văn Minh',
    bio: 'Đam mê tập gym, rèn luyện sức khỏe mỗi ngày.',
    fitnessGoal: 'Tăng cơ giảm mỡ',
    phone: '0901234567',
    birthday: '15/05/1995',
    gender: 'male',
    heightCm: 175,
    weightKg: 70,
  };

  private healthProfile: HealthProfileData = {
    medicalConditions: '',
    hasNoMedicalConditions: true,
    allergies: '',
    hasNoAllergies: true,
    workoutDays: ['mon', 'wed', 'fri'],
    preferredTimeSlots: ['18:00 - 19:30'],
    notes: 'Không có chấn thương nghiêm trọng.',
  };

  private deletionStatus: AccountDeletionStatusViewModel = {
    userId: 'preview-usr-001',
    status: 'active',
    isPendingDeletion: false,
    retentionDaysRemaining: 0,
    hasActiveBookings: false,
  };

  async getAccountHub(): Promise<AccountHubViewModel> {
    return {
      id: 'preview-usr-001',
      name: this.profile.name,
      email: 'minh.nguyen@example.com',
      role: 'member',
      avatarUrl: undefined,
    };
  }

  async getProfile(): Promise<UserProfileFormData> {
    return { ...this.profile };
  }

  async getHealthProfile(): Promise<HealthProfileData> {
    return { ...this.healthProfile };
  }

  async updateProfile(data: UserProfileFormData): Promise<void> {
    this.profile = { ...data };
  }

  async updateAvatar(image: { uri: string }): Promise<{ storageKey: string; previewUrl: string }> {
    return { storageKey: 'preview/avatar', previewUrl: image.uri };
  }

  async attachAvatar(_storageKey: string): Promise<string> {
    return this.profile.avatarUrl || '';
  }

  async updateHealthProfile(data: HealthProfileData): Promise<void> {
    this.healthProfile = { ...data };
  }

  async changePassword(_current: string, newPassword: string): Promise<void> {
    if (newPassword.length < 12 || newPassword.length > 128) {
      throw new Error('Mật khẩu mới phải có độ dài từ 12 đến 128 ký tự');
    }
  }

  async getSettings(): Promise<SettingsViewModel> {
    return { ...this.settings };
  }

  async updateSettings(values: Partial<SettingsViewModel>): Promise<SettingsViewModel> {
    this.settings = { ...this.settings, ...values };
    return { ...this.settings };
  }

  async requestAccountDeletion(_reason?: string): Promise<AccountDeletionStatusViewModel> {
    this.deletionStatus = {
      ...this.deletionStatus,
      status: 'pending_deletion',
      isPendingDeletion: true,
      requestedAt: new Date().toISOString(),
      retentionDaysRemaining: 30,
    };
    return { ...this.deletionStatus };
  }

  async getDeletionStatus(): Promise<AccountDeletionStatusViewModel> {
    return { ...this.deletionStatus };
  }

  async cancelAccountDeletion(): Promise<AccountDeletionStatusViewModel> {
    this.deletionStatus = {
      ...this.deletionStatus,
      status: 'active',
      isPendingDeletion: false,
      retentionDaysRemaining: 0,
    };
    return { ...this.deletionStatus };
  }

  async exportUserData(): Promise<{ downloadUrl?: string; requestedAt?: string; data?: unknown }> {
    return {
      downloadUrl: 'https://example.com/export/preview-usr-001.zip',
      requestedAt: new Date().toISOString(),
      data: { user_id: 'preview-usr-001', profile: this.profile },
    };
  }
}

export const previewAccountRepository = new PreviewAccountRepository();
