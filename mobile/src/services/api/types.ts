/**
 * API types matching backend OpenAPI (fitmate-v1.yaml)
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
  total?: number;
}

export interface TrainerPublicSummary {
  id: string; // UUID
  name: string;
  avatarUrl?: string | null;
  specialties: string[];
  rating: number;
  reviewCount: number;
  sessionPriceVnd: number;
  bio?: string;
  experienceYears?: number;
  isVerified?: boolean;
}

export interface TrainerPublicDetail extends TrainerPublicSummary {
  certificates: Array<{
    id: string;
    title: string;
    issuer: string;
    year: number;
  }>;
  availableDays: string[];
  availableTimeSlots: string[];
  reviews: Array<{
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export interface TrainerFilterParams {
  specialty?: string;
  minPriceVnd?: number;
  maxPriceVnd?: number;
  minRating?: number;
  cursor?: string;
  limit?: number;
}

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
  todayMeals: Array<{
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    time: string;
  }>;
}
