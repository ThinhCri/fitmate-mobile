import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  MealSectionViewModel,
  MealTimeSlot,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import type { INutritionRepository } from '../nutritionRepository';
import { apiClient, apiUploadFile } from '@/services/api/client';

export class ApiNutritionRepository implements INutritionRepository {
  private normalizeServing(portion?: string, grams?: number) {
    const normalized = portion?.trim() || '';
    const quantityMatch = normalized.match(/^([\d]+(?:[.,]\d+)?)(?:\s+|$)/);
    const parsedQuantity = quantityMatch
      ? Number.parseFloat(quantityMatch[1].replace(',', '.'))
      : 1;
    const unit = quantityMatch
      ? normalized.slice(quantityMatch[0].length).trim()
      : normalized;

    return {
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
      unit: unit && unit.length <= 50 ? unit : 'khẩu phần',
      portionSize: grams && grams > 0 ? grams : 1,
    };
  }

  private mapPlannedMeal(raw: any): PlannedMealSlotViewModel {
    const quantity = raw.serving_quantity ?? 1;
    const unit = raw.serving_unit || 'khẩu phần';
    return {
      id: raw.id,
      dayIndex: raw.day_of_week,
      dayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][raw.day_of_week] || '',
      mealSlot: raw.meal_slot,
      foodName: raw.food_name,
      calories: raw.calories ?? 0,
      portion: `${quantity} ${unit}`,
      grams: raw.grams ?? undefined,
      proteinGrams: raw.protein_g ?? 0,
      carbsGrams: raw.carbs_g ?? 0,
      fatGrams: raw.fat_g ?? 0,
      notes: raw.notes ?? undefined,
      isCompleted: raw.is_consumed ?? false,
      consumedDate: raw.consumed_date ?? undefined,
      mealLogId: raw.meal_log_id ?? undefined,
    };
  }

  private plannedMealPayload(item: Omit<PlannedMealSlotViewModel, 'id' | 'isCompleted'>) {
    return {
      day_of_week: item.dayIndex,
      meal_slot: item.mealSlot,
      food_name: item.foodName,
      serving_quantity: Number.parseFloat(item.portion || '') || 1,
      serving_unit: (item.portion || '').replace(/^\s*[\d.,]+\s*/, '') || 'khẩu phần',
      grams: item.grams,
      calories: item.calories,
      protein_g: item.proteinGrams,
      carbs_g: item.carbsGrams,
      fat_g: item.fatGrams,
      notes: item.notes,
    };
  }
  private mapMeal(raw: any): FoodItemViewModel {
    const quantity = raw.serving_quantity ?? raw.portion_size ?? 1;
    const unit = raw.serving_unit || 'khẩu phần';
    const source = raw.source === 'ai_estimate'
      ? (raw.confirmed ? 'ai_confirmed' : 'ai_estimated')
      : 'manual';
    return {
      id: raw.id,
      name: raw.food_name,
      portion: `${quantity} ${unit}`,
      grams: raw.grams ?? undefined,
      calories: raw.calories ?? 0,
      proteinGrams: raw.protein_g ?? 0,
      carbsGrams: raw.carbs_g ?? 0,
      fatGrams: raw.fat_g ?? 0,
      source,
      mealSlot: raw.meal_slot || 'lunch',
      loggedAt: raw.logged_at,
      photoUri: raw.image_url ?? undefined,
      notes: raw.notes ?? undefined,
      aiConfidence: raw.ai_confidence ?? undefined,
      confirmed: raw.confirmed ?? false,
    };
  }

  async getDaySummary(dateString?: string): Promise<DayNutritionSummaryViewModel> {
    const today = new Date();
    const effectiveDateStr =
      dateString || today.toISOString().slice(0, 10);

    const [rawMeals, dashboard] = await Promise.all([
      apiClient<any[]>(`/me/nutrition/meals?from=${effectiveDateStr}&to=${effectiveDateStr}`),
      apiClient<any>(`/me/dashboard?date=${effectiveDateStr}`),
    ]);

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

      const slot: MealTimeSlot = ['breakfast', 'lunch', 'dinner', 'snack'].includes(m.meal_slot)
        ? m.meal_slot
        : 'lunch';
      sections[slot].push(this.mapMeal(m));
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
        target: dashboard?.nutrition?.target_calories ?? 0,
        burnedExercise: dashboard?.workout?.total_calories_burned ?? 0,
      },
      macros: {
        protein: { current: totalProtein, target: dashboard?.nutrition?.target_protein_g ?? 0 },
        carbs: { current: totalCarbs, target: dashboard?.nutrition?.target_carbs_g ?? 0 },
        fat: { current: totalFat, target: dashboard?.nutrition?.target_fat_g ?? 0 },
      },
      meals: mealSections,
    };
  }

  async getWeeklyMenu(weekStart: string): Promise<PlannedMealSlotViewModel[]> {
    const raw = await apiClient<any[]>(`/me/nutrition/weekly-plan?week_start=${encodeURIComponent(weekStart)}`);
    return (Array.isArray(raw) ? raw : []).map((item) => this.mapPlannedMeal(item));
  }

  async getFoodItem(id: string): Promise<FoodItemViewModel> {
    const raw = await apiClient<any>('/me/nutrition/meals/' + encodeURIComponent(id));
    return this.mapMeal(raw);
  }

  async addFoodItem(item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel> {
    const serving = this.normalizeServing(item.portion, item.grams);
    const raw = await apiClient<any>('/me/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify({
        food_name: item.name,
        calories: item.calories,
        protein_g: item.proteinGrams,
        carbs_g: item.carbsGrams,
        fat_g: item.fatGrams,
        portion_size: serving.portionSize,
        meal_slot: item.mealSlot,
        serving_quantity: serving.quantity,
        serving_unit: serving.unit,
        grams: item.grams,
        notes: item.notes,
        source: item.source === 'ai_confirmed' || item.source === 'ai_estimated' ? 'ai_estimate' : 'manual',
        ai_confidence: item.aiConfidence,
        confirmed: item.confirmed ?? true,
        logged_at: item.loggedAt || new Date().toISOString(),
      }),
    });
    return this.mapMeal(raw);
  }

  async updateFoodItem(id: string, item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel> {
    const serving = this.normalizeServing(item.portion, item.grams);
    const raw = await apiClient<any>('/me/nutrition/meals/' + encodeURIComponent(id), {
      method: 'PATCH',
      body: JSON.stringify({
        food_name: item.name,
        calories: item.calories,
        protein_g: item.proteinGrams,
        carbs_g: item.carbsGrams,
        fat_g: item.fatGrams,
        portion_size: serving.portionSize,
        meal_slot: item.mealSlot,
        serving_quantity: serving.quantity,
        serving_unit: serving.unit,
        grams: item.grams,
        notes: item.notes ?? '',
        confirmed: item.confirmed ?? true,
      }),
    });
    return this.mapMeal(raw);
  }

  async deleteFoodItem(id: string): Promise<void> {
    await apiClient('/me/nutrition/meals/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  async addPlannedMeal(item: Omit<PlannedMealSlotViewModel, 'id' | 'isCompleted'>, weekStart: string) {
    const raw = await apiClient<any>(`/me/nutrition/weekly-plan?week_start=${encodeURIComponent(weekStart)}`, {
      method: 'POST',
      body: JSON.stringify(this.plannedMealPayload(item)),
    });
    return this.mapPlannedMeal(raw);
  }

  async updatePlannedMeal(id: string, item: Omit<PlannedMealSlotViewModel, 'id' | 'isCompleted'>, weekStart: string) {
    const raw = await apiClient<any>(`/me/nutrition/weekly-plan/${encodeURIComponent(id)}?week_start=${encodeURIComponent(weekStart)}`, {
      method: 'PATCH',
      body: JSON.stringify(this.plannedMealPayload(item)),
    });
    return this.mapPlannedMeal(raw);
  }

  async deletePlannedMeal(id: string): Promise<void> {
    await apiClient(`/me/nutrition/weekly-plan/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async consumePlannedMeal(id: string, date: string): Promise<void> {
    await apiClient(`/me/nutrition/weekly-plan/${encodeURIComponent(id)}/consume`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  async scanMealImage(uri: string, detectedMimeType?: string | null) {
    const normalizedUri = uri.toLowerCase().split('?')[0];
    const mimeType = detectedMimeType && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(detectedMimeType.toLowerCase())
      ? detectedMimeType.toLowerCase()
      : normalizedUri.endsWith('.png')
        ? 'image/png'
        : normalizedUri.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';
    const raw = await apiUploadFile<{
      items?: Array<{ name?: string; calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number }>;
      ingredients?: string[];
      confidence?: number | null;
      note?: string | null;
    }>(
      '/me/nutrition/scan',
      uri,
      mimeType,
      {}
    );
    return {
      candidates: (raw.items || []).map((item, index) => ({
        id: `scan-${index}`,
        name: item.name || 'Tổng dinh dưỡng bữa ăn',
        portionDescription: '1 khẩu phần',
        calories: item.calories ?? 0,
        protein: item.protein_g ?? 0,
        carbs: item.carbs_g ?? 0,
        fat: item.fat_g ?? 0,
        confidenceScore: raw.confidence ?? undefined,
        selected: true,
      })),
      ingredients: (raw.ingredients || [])
        .filter((ingredient): ingredient is string => typeof ingredient === 'string' && ingredient.trim().length > 0)
        .map((ingredient) => ingredient.trim()),
    };
  }
}

export const apiNutritionRepository = new ApiNutritionRepository();
