/**
 * Account Hub & Settings Types and View Models (Stitch A06 - A10)
 */

export interface AccountHubViewModel {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'pt';
  avatarUrl?: string;
  isVerified?: boolean;
  upcomingBookingCount?: number;
  friendCount?: number;
  unreadChatCount?: number;
  unreadNotifCount?: number;
}

export interface UserProfileFormData {
  name: string;
  bio: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  heightCm: number;
  weightKg: number;
  fitnessGoal: string;
}

export interface HealthProfileData {
  medicalConditions: string;
  hasNoMedicalConditions: boolean;
  allergies: string;
  hasNoAllergies: boolean;
  workoutDays: string[];
  preferredTimeSlots: string[];
  notes: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsViewModel {
  notificationsEnabled: boolean;
  emailAlertsEnabled: boolean;
  language: string;
  appVersion: string;
}
