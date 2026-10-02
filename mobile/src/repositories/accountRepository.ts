import {
  AccountHubViewModel,
  UserProfileFormData,
  HealthProfileData,
  SettingsViewModel,
} from '@/features/account/accountTypes';
import { getDataSourceMode } from './repositoryTypes';
import { apiAccountRepository } from './api/apiAccountRepository';
import { previewAccountRepository } from './preview/previewAccountRepository';

export interface AccountDeletionStatusViewModel {
  userId: string;
  status: string;
  isPendingDeletion: boolean;
  requestedAt?: string;
  scheduledPermanentDeletionAt?: string;
  retentionDaysRemaining: number;
  hasActiveBookings: boolean;
}

export interface IAccountRepository {
  getAccountHub(): Promise<AccountHubViewModel>;
  getHealthProfile(): Promise<HealthProfileData>;
  updateProfile(data: UserProfileFormData): Promise<void>;
  updateHealthProfile(data: HealthProfileData): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  getSettings(): Promise<SettingsViewModel>;
  requestAccountDeletion(reason?: string): Promise<AccountDeletionStatusViewModel>;
  getDeletionStatus(): Promise<AccountDeletionStatusViewModel>;
  cancelAccountDeletion(): Promise<AccountDeletionStatusViewModel>;
  exportUserData(): Promise<{ downloadUrl?: string; requestedAt?: string }>;
}

/**
 * Composition root resolver for Account repository.
 * Enforces production default with strict preview isolation.
 */
export function getAccountRepository(): IAccountRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewAccountRepository;
  }
  return apiAccountRepository;
}
