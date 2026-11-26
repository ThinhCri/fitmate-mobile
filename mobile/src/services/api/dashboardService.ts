import { apiClient } from './client';
import { authService } from './authService';
import { resolveOptionalApiResourceUrl } from './resourceUrl';
import type { MemberDashboardSummary } from './types';

interface DashboardWire {
  date: string;
  nutrition?: { total_calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number; target_calories?: number | null; target_protein_g?: number | null; target_carbs_g?: number | null; target_fat_g?: number | null };
  workout?: { total_calories_burned?: number };
  streak?: { current_streak_days?: number };
  today_workout?: { id: string; resource_type: 'plan' | 'session'; title: string; duration_minutes: number; exercise_count: number; status: string } | null;
  today_meals?: Array<{ id: string; food_name: string; meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'; calories: number; logged_at: string }>;
  upcoming_appointment?: { id: string; pt_name?: string | null; slot_start_utc: string; duration_minutes: number; status: string } | null;
}

export const dashboardService = {
  async getMemberDashboard(): Promise<MemberDashboardSummary> {
    const [dashboard, profile] = await Promise.all([
      apiClient<DashboardWire>('/me/dashboard'),
      authService.getMe(),
    ]);
    const date = new Date(`${dashboard.date}T00:00:00`);
    return {
      greetingName: profile.full_name?.trim() || profile.email,
      avatarUrl: resolveOptionalApiResourceUrl(profile.avatar_url),
      dateLabel: Number.isNaN(date.getTime()) ? dashboard.date : date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
      calories: { consumed: dashboard.nutrition?.total_calories ?? 0, target: dashboard.nutrition?.target_calories ?? 0, burned: dashboard.workout?.total_calories_burned ?? 0 },
      macros: {
        protein: { currentGrams: dashboard.nutrition?.protein_g ?? 0, targetGrams: dashboard.nutrition?.target_protein_g ?? 0 },
        carbs: { currentGrams: dashboard.nutrition?.carbs_g ?? 0, targetGrams: dashboard.nutrition?.target_carbs_g ?? 0 },
        fat: { currentGrams: dashboard.nutrition?.fat_g ?? 0, targetGrams: dashboard.nutrition?.target_fat_g ?? 0 },
      },
      water: { consumedMl: 0, targetMl: 0 },
      streakDays: dashboard.streak?.current_streak_days ?? 0,
      todayWorkout: dashboard.today_workout ? {
        id: dashboard.today_workout.id,
        resourceType: dashboard.today_workout.resource_type,
        title: dashboard.today_workout.title,
        durationMinutes: dashboard.today_workout.duration_minutes,
        exerciseCount: dashboard.today_workout.exercise_count,
        isCompleted: dashboard.today_workout.status === 'Completed',
      } : null,
      todayMeals: (dashboard.today_meals ?? []).map((meal) => ({
        id: meal.id,
        name: meal.food_name,
        type: meal.meal_slot,
        calories: meal.calories,
        time: new Date(meal.logged_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })),
      upcomingAppointment: dashboard.upcoming_appointment ? {
        id: dashboard.upcoming_appointment.id,
        trainerName: dashboard.upcoming_appointment.pt_name?.trim() || 'Huấn luyện viên',
        slotStartUtc: dashboard.upcoming_appointment.slot_start_utc,
        durationMinutes: dashboard.upcoming_appointment.duration_minutes,
        status: dashboard.upcoming_appointment.status,
      } : null,
    };
  },
};
