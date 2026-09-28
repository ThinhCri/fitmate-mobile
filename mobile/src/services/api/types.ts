/**
 * Wire DTOs and View Models matching backend OpenAPI (fitmate-v1.yaml)
 */

// ==========================================
// 1. Wire DTOs (Exact OpenAPI snake_case)
// ==========================================

export interface UserSummary {
  id: string; // uuid
  email: string;
  full_name: string;
  role: 'member' | 'pt' | 'admin';
  avatar_url?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other';
  birthday?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_goal?: string | null;
  training_days?: string[];
  specialty?: string | null;
  experience_years?: number | null;
  price_per_session_vnd?: number | null;
  certificate_status?: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string; // 12-128 chars
  full_name: string;
  role: 'member' | 'pt';
  height_cm?: number;
  weight_kg?: number;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  fitness_goal?: string;
  training_days?: string[];
  specialty?: string;
  experience_years?: number;
  price_per_session_vnd?: number;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_label?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: UserSummary;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string; // 12-128 chars
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export function isProblemDetails(data: unknown): data is ProblemDetails {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    (typeof obj.title === 'string' || typeof obj.detail === 'string') &&
    (obj.status === undefined || typeof obj.status === 'number')
  );
}

export type AdminMfaChallengeResponse = {
  mfaRequired: true;
  challengeId: string;
  expiresIn: number;
};

export type AdminMfaSetupResponse = {
  mfaSetupRequired: true;
  setupToken: string;
};

export type AdminMfaResponse = AdminMfaChallengeResponse | AdminMfaSetupResponse;

export function isAdminMfaResponse(data: unknown): data is AdminMfaResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj.mfaRequired === true || obj.mfaSetupRequired === true;
}

export interface PTPublicProfile {
  id: string; // uuid
  full_name: string;
  avatar_url: string | null;
  specialty: string;
  experience_years: number;
  price_per_session_vnd: number;
  rating: number;
  reviews_count: number;
  certificate_status: 'verified' | string;
}

export interface Service {
  id: string; // uuid
  name: string;
  description: string;
  price_vnd: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Review {
  id: string; // uuid
  from_user_id: string; // uuid
  pt_id: string; // uuid
  rating: number;
  text: string;
  created_at: string; // date-time
}

export interface PTPublicDetail extends PTPublicProfile {
  bio?: string;
  services?: Service[];
  reviews?: Review[];
}

export interface AvailabilitySlot {
  id: string; // uuid
  slot_start_utc: string; // date-time
  slot_start_local: string; // date-time
  duration_minutes: number;
  status: 'open' | 'held' | 'booked';
}

export interface ListTrainersResponse {
  items: PTPublicProfile[];
  nextCursor?: string | null;
}

export interface TrainerFilterParams {
  specialty?: string;
  minPriceVnd?: number;
  maxPriceVnd?: number;
  minRating?: number;
  cursor?: string;
  limit?: number;
}

export interface GetAvailabilityParams {
  from: string; // date (YYYY-MM-DD) - required by OpenAPI
  to: string; // date (YYYY-MM-DD) - required by OpenAPI
}

// ==========================================
// 2. View Models (camelCase for Mobile UI)
// ==========================================

export interface TrainerSummaryViewModel {
  id: string;
  name: string;
  avatarUrl: string | null;
  specialties: string[];
  rating: number;
  reviewCount: number;
  sessionPriceVnd: number;
  experienceYears: number;
  isVerified: boolean;
}

export interface TrainerServiceViewModel {
  id: string;
  name: string;
  description: string;
  priceVnd: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface TrainerReviewViewModel {
  id: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TrainerDetailViewModel extends TrainerSummaryViewModel {
  bio?: string;
  services: TrainerServiceViewModel[];
  reviews: TrainerReviewViewModel[];
}

export interface AvailabilitySlotViewModel {
  id: string;
  slotStartUtc: string;
  slotStartLocal: string;
  durationMinutes: number;
  status: 'open' | 'held' | 'booked';
}

// ==========================================
// 3. Dedicated Mappers (Wire DTO -> View Model)
// ==========================================

export function mapPTPublicProfileToSummary(
  dto: PTPublicProfile
): TrainerSummaryViewModel {
  const specialties = dto.specialty
    ? dto.specialty
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    id: dto.id,
    name: dto.full_name,
    avatarUrl: dto.avatar_url,
    specialties: specialties.length > 0 ? specialties : [dto.specialty || 'Thể hình'],
    rating: typeof dto.rating === 'number' ? dto.rating : 5.0,
    reviewCount: typeof dto.reviews_count === 'number' ? dto.reviews_count : 0,
    sessionPriceVnd: dto.price_per_session_vnd || 0,
    experienceYears: dto.experience_years || 0,
    isVerified: dto.certificate_status === 'verified',
  };
}

export function mapPTPublicDetailToDetail(
  dto: PTPublicDetail
): TrainerDetailViewModel {
  const summary = mapPTPublicProfileToSummary(dto);

  const services: TrainerServiceViewModel[] = (dto.services || []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    priceVnd: s.price_vnd,
    durationMinutes: s.duration_minutes,
    isActive: s.is_active,
  }));

  const reviews: TrainerReviewViewModel[] = (dto.reviews || []).map((r) => ({
    id: r.id,
    reviewerId: r.from_user_id,
    rating: r.rating,
    comment: r.text || '',
    createdAt: r.created_at,
  }));

  return {
    ...summary,
    bio: dto.bio,
    services,
    reviews,
  };
}

export function mapAvailabilitySlotToViewModel(
  dto: AvailabilitySlot
): AvailabilitySlotViewModel {
  return {
    id: dto.id,
    slotStartUtc: dto.slot_start_utc,
    slotStartLocal: dto.slot_start_local,
    durationMinutes: dto.duration_minutes,
    status: dto.status,
  };
}

// ==========================================
// 4. Dashboard View Model (CONTRACT_GAP noted)
// ==========================================

export interface MemberDashboardSummary {
  greetingName: string;
  dateLabel: string;
  calories: {
    consumed: number;
    target: number;
    burned: number;
  };
  macros: {
    protein: { currentGrams: number; targetGrams: number };
    carbs: { currentGrams: number; targetGrams: number };
    fat: { currentGrams: number; targetGrams: number };
  };
  water: {
    consumedMl: number;
    targetMl: number;
  };
  streakDays: number;
  todayWorkout?: {
    id: string;
    title: string;
    durationMinutes: number;
    exerciseCount: number;
    isCompleted: boolean;
  } | null;
  todayMeals: {
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    time: string;
  }[];
}
