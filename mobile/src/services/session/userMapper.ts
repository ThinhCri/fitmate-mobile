import type { User, Gender, CertificateStatus } from '@/types';
import type { UserSummary, UserProfile } from '../api/types';

export function mapToDomainUser(
  summary: UserSummary,
  profile?: UserProfile | null
): User {
  const role = (summary.role ? summary.role.toLowerCase() : 'member') as
    | 'member'
    | 'pt'
    | 'admin';
  const isPt = role === 'pt';

  let gender: Gender = 'Khác';
  if (profile?.gender === 'male') {
    gender = 'Nam';
  } else if (profile?.gender === 'female') {
    gender = 'Nữ';
  }

  let certificateStatus: CertificateStatus = 'unverified';
  let isVerified = false;
  if (isPt) {
    if (profile?.certificate_status === 'verified') {
      certificateStatus = 'verified';
      isVerified = true;
    } else {
      certificateStatus = 'pending';
      isVerified = false;
    }
  }

  const mappedUser: User = {
    id: summary.id,
    role,
    email: summary.email,
    profile: {
      avatar: profile?.avatar_url ?? summary.avatar_url ?? null,
      name: profile?.full_name ?? summary.full_name,
      bio: '',
      goal: profile?.fitness_goal ?? '',
      phone: profile?.phone ?? '',
      birthday: profile?.birthday ?? '',
      gender,
      height: profile?.height_cm ?? 0,
      weight: profile?.weight_kg ?? 0,
      medicalCondition: '',
      allergies: [],
      allergySurveyDone: false,
      trainingDays: profile?.training_days ?? [],
      trainingTime: '',
      trainingTimes: [],
      ...(profile?.timezone ? { timezone: profile.timezone } : {}),
      spec: profile?.specialty
        ? profile.specialty.split(',').map((s) => s.trim())
        : [],
      exp: profile?.experience_years ?? 0,
      price: profile?.price_per_session_vnd ?? 0,
      isVerified,
      certificateStatus,
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

  return mappedUser;
}
