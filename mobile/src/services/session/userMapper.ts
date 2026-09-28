import type { User } from '@/types';
import { UserProfile, UserSummary } from '@/services/api/types';

/**
 * Pure domain user mapper (MOB-800)
 * Maps backend wire DTOs (UserSummary, UserProfile) to domain User.
 *
 * Guarantees:
 * - Plaintext password is never stored (password: '')
 * - PT registration starts as unverified (never auto-verified)
 */
export function mapToDomainUser(
  summary: UserSummary,
  profile?: UserProfile | null
): User {
  const isPt = summary.role === 'pt';
  const certificateStatus = isPt
    ? profile?.certificate_status === 'verified'
      ? 'verified'
      : 'pending'
    : 'unverified';

  return {
    email: summary.email,
    password: '', // Plaintext password is never persisted
    profile: {
      avatar: summary.avatar_url || profile?.avatar_url || null,
      name: summary.full_name || profile?.full_name || 'Người dùng Fitmate',
      bio: '',
      goal: profile?.fitness_goal || '',
      phone: profile?.phone || '',
      birthday: profile?.birthday || '2000-01-01',
      gender:
        profile?.gender === 'female'
          ? 'Nữ'
          : profile?.gender === 'other'
          ? 'Khác'
          : 'Nam',
      height: profile?.height_cm || 170,
      weight: profile?.weight_kg || 65,
      medicalCondition: '',
      allergies: [],
      allergySurveyDone: false,
      trainingDays: profile?.training_days || ['T2', 'T4', 'T6'],
      trainingTime: '18:00 - 19:30',
      trainingTimes: [],
      spec: profile?.specialty
        ? profile.specialty.split(',').map((s: string) => s.trim())
        : [],
      exp: profile?.experience_years || 0,
      price: profile?.price_per_session_vnd || 0,
      isVerified: certificateStatus === 'verified',
      certificateStatus: certificateStatus as any,
      certificates: [],
      isPt,
      isSelf: true,
    },
    streak: 0,
    rewardPoints: 0,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    workoutSummary: null,
    appointments: [],
    aiChats: [],
    notifications: [],
    friendRequests: [],
    sentRequests: [],
    friendsList: [],
    conversations: {},
    posts: [],
    reviews: [],
    workoutHistory: [],
  };
}
