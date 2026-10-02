import { apiClient } from './client';
import { authService } from './authService';
import type { MemberDashboardSummary } from './types';

interface DashboardWire {
  date: string;
  nutrition?: { total_calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number; target_calories?: number | null };
  workout?: { total_calories_burned?: number };
  streak?: { current_streak_days?: number };
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
      dateLabel: Number.isNaN(date.getTime()) ? dashboard.date : date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
      calories: { consumed: dashboard.nutrition?.total_calories ?? 0, target: dashboard.nutrition?.target_calories ?? 0, burned: dashboard.workout?.total_calories_burned ?? 0 },
      macros: {
        protein: { currentGrams: dashboard.nutrition?.protein_g ?? 0, targetGrams: 0 },
        carbs: { currentGrams: dashboard.nutrition?.carbs_g ?? 0, targetGrams: 0 },
        fat: { currentGrams: dashboard.nutrition?.fat_g ?? 0, targetGrams: 0 },
      },
      water: { consumedMl: 0, targetMl: 0 },
      streakDays: dashboard.streak?.current_streak_days ?? 0,
      todayWorkout: null,
      todayMeals: [],
    };
  },
};
