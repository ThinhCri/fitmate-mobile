import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { IAccountRepository, AccountDeletionStatusViewModel } from '../accountRepository';

export class PreviewAccountRepository implements IAccountRepository {
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

  async updateHealthProfile(data: HealthProfileData): Promise<void> {
    this.healthProfile = { ...data };
  }

  async changePassword(_current: string, newPassword: string): Promise<void> {
    if (newPassword.length < 12 || newPassword.length > 128) {
      throw new Error('Mật khẩu mới phải có độ dài từ 12 đến 128 ký tự');
    }
  }

  async getSettings(): Promise<SettingsViewModel> {
    return {
      notificationsEnabled: true,
      emailAlertsEnabled: false,
      language: 'vi',
      appVersion: '1.0.0-preview',
    };
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

  async exportUserData(): Promise<{ downloadUrl?: string; requestedAt?: string }> {
    return {
      downloadUrl: 'https://example.com/export/preview-usr-001.zip',
      requestedAt: new Date().toISOString(),
    };
  }
}

export const previewAccountRepository = new PreviewAccountRepository();
