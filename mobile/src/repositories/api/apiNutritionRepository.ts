import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  MealSectionViewModel,
  MealTimeSlot,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import type { INutritionRepository } from '../nutritionRepository';
import { apiClient } from '@/services/api/client';

export class ApiNutritionRepository implements INutritionRepository {
  async getDaySummary(dateString?: string): Promise<DayNutritionSummaryViewModel> {
    const today = new Date();
    const effectiveDateStr =
      dateString || today.toISOString().slice(0, 10);

    const rawMeals = await apiClient<any[]>(
      `/me/nutrition/meals?from=${effectiveDateStr}&to=${effectiveDateStr}`
    );

    const mealsList = Array.isArray(rawMeals) ? rawMeals : [];

    let totalConsumed = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const sections: Record<MealTimeSlot, FoodItemViewModel[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    mealsList.forEach((m: any) => {
      const cal = m.calories || 0;
      const prot = m.protein_g || 0;
      const carbs = m.carbs_g || 0;
      const fat = m.fat_g || 0;

      totalConsumed += cal;
      totalProtein += prot;
      totalCarbs += carbs;
      totalFat += fat;

      const hour = m.logged_at ? new Date(m.logged_at).getHours() : 12;
      let slot: MealTimeSlot = 'lunch';
      if (hour < 10) slot = 'breakfast';
      else if (hour < 15) slot = 'lunch';
      else if (hour < 20) slot = 'dinner';
      else slot = 'snack';

      sections[slot].push({
        id: m.id,
        name: m.food_name,
        portion: `${m.portion_size || 1} phần`,
        calories: cal,
        proteinGrams: prot,
        carbsGrams: carbs,
        fatGrams: fat,
        source: m.source === 'ai_estimate' ? 'ai_estimated' : 'manual',
        mealSlot: slot,
        loggedAt: m.logged_at,
        photoUri: m.image_url ?? undefined,
      });
    });

    const isToday =
      effectiveDateStr === today.toISOString().slice(0, 10);

    const dateObj = new Date(effectiveDateStr + 'T00:00:00Z');
    const dateDisplay = isNaN(dateObj.getTime())
      ? effectiveDateStr
      : dateObj.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

    const mealSections: MealSectionViewModel[] = [
      {
        slot: 'breakfast',
        title: 'Bữa sáng',
        subtitle: 'Khuyến nghị 400 - 550 kcal',
        totalCalories: sections.breakfast.reduce((sum, f) => sum + f.calories, 0),
        items: sections.breakfast,
      },
      {
        slot: 'lunch',
        title: 'Bữa trưa',
        subtitle: 'Khuyến nghị 650 - 800 kcal',
        totalCalories: sections.lunch.reduce((sum, f) => sum + f.calories, 0),
        items: sections.lunch,
      },
      {
        slot: 'dinner',
        title: 'Bữa tối',
        subtitle: 'Khuyến nghị 500 - 650 kcal',
        totalCalories: sections.dinner.reduce((sum, f) => sum + f.calories, 0),
        items: sections.dinner,
      },
      {
        slot: 'snack',
        title: 'Bữa phụ & Tráng miệng',
        subtitle: 'Khuyến nghị 150 - 250 kcal',
        totalCalories: sections.snack.reduce((sum, f) => sum + f.calories, 0),
        items: sections.snack,
      },
    ];

    return {
      dateString: effectiveDateStr,
      dateDisplay,
      isToday,
      calories: {
        consumed: totalConsumed,
        target: 2150,
        burnedExercise: 380,
      },
      macros: {
        protein: { current: totalProtein, target: 140 },
        carbs: { current: totalCarbs, target: 220 },
        fat: { current: totalFat, target: 65 },
      },
      meals: mealSections,
    };
  }

  async getWeeklyMenu(): Promise<PlannedMealSlotViewModel[]> {
    const raw = await apiClient<any>('/me/nutrition/schedule');
    if (!raw || !Array.isArray(raw.slots)) {
      return [];
    }
    return raw.slots.map((s: any, idx: number) => ({
      id: s.id || `slot-${idx}`,
      dayOfWeek: s.day_of_week || 0,
      slot: s.meal_slot || 'lunch',
      mealName: s.name || s.meal_name || 'Bữa ăn theo kế hoạch',
      targetCalories: s.target_calories || 500,
      isCompleted: Boolean(s.is_completed),
    }));
  }

  async getFoodItem(id: string): Promise<FoodItemViewModel> {
    const raw = await apiClient<any>('/me/nutrition/meals/' + encodeURIComponent(id));
    return {
      id: raw.id,
      name: raw.food_name,
      portion: `${raw.portion_size || 1} phần`,
      calories: raw.calories || 0,
      proteinGrams: raw.protein_g || 0,
      carbsGrams: raw.carbs_g || 0,
      fatGrams: raw.fat_g || 0,
      source: raw.source === 'ai_estimate' ? 'ai_estimated' : 'manual',
      mealSlot: 'lunch',
      loggedAt: raw.logged_at,
      photoUri: raw.image_url ?? undefined,
    };
  }

  async addFoodItem(item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel> {
    const raw = await apiClient<any>('/me/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify({
        food_name: item.name,
        calories: item.calories,
        protein_g: item.proteinGrams,
        carbs_g: item.carbsGrams,
        fat_g: item.fatGrams,
        portion_size: item.grams ? item.grams / 100 : 1,
        logged_at: item.loggedAt || new Date().toISOString(),
      }),
    });
    return {
      id: raw.id,
      name: raw.food_name,
      portion: item.portion,
      calories: raw.calories,
      proteinGrams: raw.protein_g,
      carbsGrams: raw.carbs_g,
      fatGrams: raw.fat_g,
      source: 'manual',
      mealSlot: item.mealSlot,
      loggedAt: raw.logged_at,
    };
  }

  async deleteFoodItem(id: string): Promise<void> {
    await apiClient('/me/nutrition/meals/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  async updatePlannedSlot(slotId: string, isCompleted: boolean): Promise<void> {
    await apiClient('/me/nutrition/schedule/' + encodeURIComponent(slotId), {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    });
  }
}

export const apiNutritionRepository = new ApiNutritionRepository();
