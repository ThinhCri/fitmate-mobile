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
  timezone?: string | null;
  medical_conditions?: string[];
  allergies?: string[];
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

export interface RegistrationPendingResponse {
  verification_required: true;
  email: string;
  expires_in_seconds: number;
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
  code?: string;
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

export interface ServiceInput {
  name: string;
  description?: string;
  price_vnd: number;
  duration_minutes: number;
}

export interface ServiceUpdate {
  name?: string;
  description?: string;
  price_vnd?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface AvailabilitySlotInput {
  slot_start_local: string; // date-time
  duration_minutes: number; // 15..240
}

export interface SetAvailabilityRequest {
  slots: AvailabilitySlotInput[];
}

export interface PtCertificate {
  id: string; // uuid
  pt_id: string; // uuid
  title: string;
  issued_by: string;
  code: string;
  issue_date: string; // date (YYYY-MM-DD)
  status: 'pending' | 'approved' | 'rejected' | string;
  image_url?: string | null;
  reject_reason?: string | null;
  verified_at?: string | null;
}

export interface CertificatePage {
  items: PtCertificate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UploadResponse {
  storageKey: string;
  uri: string;
  signedUrl: string;
}

export interface UploadFilePayload {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UserProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: string;
  training_days?: string[];
  medical_conditions?: string[];
  allergies?: string[];
  timezone?: string;
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
// 4. Dashboard View Model
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

// ==========================================
// 5. Booking, Payment, & Reschedule Wire DTOs
// ==========================================

export type AppointmentStatusWire =
  | 'Held'
  | 'Pending'
  | 'Confirmed'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'Expired';

export type PaymentStatusWire =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'PartialRefunded';

export type RefundStatusWire = 'Pending' | 'Succeeded' | 'Failed';

export type RescheduleRequestStatusWire =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Cancelled';

export interface AppointmentWire {
  id: string;
  member_id: string;
  pt_user_id: string;
  service_id: string;
  slot_start_utc: string;
  duration_minutes: number;
  status: AppointmentStatusWire;
  hold_expires_at_utc?: string | null;
  acceptance_deadline_utc?: string | null;
  confirmed_at_utc?: string | null;
  started_at_utc?: string | null;
  completed_at_utc?: string | null;
  cancelled_at_utc?: string | null;
  rescheduled_count: number;
  price_listed_vnd: number;
  discount_vnd: number;
  actual_paid_vnd: number;
  platform_fee_rate_bps: number;
  platform_fee_vnd: number;
  trainer_share_vnd: number;
  policy_version: string;
  payment_id?: string | null;
}

export interface ListAppointmentsResponse {
  items: AppointmentWire[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateBookingHoldResponseWire {
  hold_id: string;
  hold_expires_at: string;
  appointment_id: string;
  appointment_status: AppointmentStatusWire;
}

export interface BookingHoldStatusResponseWire {
  hold_id: string;
  expires_at: string;
  is_active: boolean;
}

export interface PaymentWire {
  id: string;
  appointment_id: string;
  method: 'vnpay' | 'payos';
  status: PaymentStatusWire;
  amount_vnd: number;
  redirect_url?: string | null;
  provider_txn_ref?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface CreateRescheduleRequestBodyWire {
  new_slot_start_utc: string;
  reason: string;
}

export interface BookingRescheduleResponseWire {
  id: string;
  appointment_id: string;
  requested_by_user_id: string;
  old_slot_start_utc: string;
  new_slot_start_utc: string;
  duration_minutes: number;
  status: RescheduleRequestStatusWire;
  reason: string;
  deadline_utc: string;
  created_at_utc: string;
  responded_at_utc?: string | null;
  rejection_reason?: string | null;
}
