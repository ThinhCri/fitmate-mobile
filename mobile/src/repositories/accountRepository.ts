import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { apiAccountRepository } from './api/apiAccountRepository';

export interface AccountDeletionStatusViewModel {
  userId: string;
  status: string;
  isPendingDeletion: boolean;
  requestedAt?: string;
  scheduledPermanentDeletionAt?: string;
  retentionDaysRemaining: number;
  hasActiveBookings: boolean;
}

export interface UploadedAvatar {
  storageKey: string;
  previewUrl: string;
}

export interface IAccountRepository {
  getAccountHub(): Promise<AccountHubViewModel>;
  getProfile(): Promise<UserProfileFormData>;
  getHealthProfile(): Promise<HealthProfileData>;
  updateProfile(data: UserProfileFormData): Promise<void>;
  updateAvatar(image: { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number }): Promise<UploadedAvatar>;
  attachAvatar(storageKey: string): Promise<string>;
  updateHealthProfile(data: HealthProfileData): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  getSettings(): Promise<SettingsViewModel>;
  updateSettings(values: Partial<Pick<SettingsViewModel, 'notificationsEnabled' | 'emailAlertsEnabled' | 'pushNotificationsEnabled' | 'language' | 'theme'>>): Promise<SettingsViewModel>;
  sendDeletionOtp(): Promise<{ expiresAt: string; resendAfterSeconds: number }>;
  requestAccountDeletion(otp: string, reason?: string): Promise<AccountDeletionStatusViewModel>;
  getDeletionStatus(): Promise<AccountDeletionStatusViewModel>;
  cancelAccountDeletion(): Promise<AccountDeletionStatusViewModel>;
  exportUserData(): Promise<{ downloadUrl?: string; requestedAt?: string; data?: unknown }>;
}

/**
 * Composition root resolver for Account repository.
 * Uses the server-backed repository in every build.
 */
export function getAccountRepository(): IAccountRepository {
  return apiAccountRepository;
}
