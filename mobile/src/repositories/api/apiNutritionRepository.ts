import {
  DayNutritionSummaryViewModel,
  FoodCandidateIngredientViewModel,
  FoodItemViewModel,
  MealSectionViewModel,
  MealTimeSlot,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import type { INutritionRepository } from '../nutritionRepository';
import { apiClient, apiUploadFile } from '@/services/api/client';

export class ApiNutritionRepository implements INutritionRepository {
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

      const hour = m.logged_at ? new Date(m.logged_at).getHours() : 12;
      let slot: MealTimeSlot = 'lunch';
      if (hour < 10) slot = 'breakfast';
      else if (hour < 15) slot = 'lunch';
      else if (hour < 20) slot = 'dinner';
      else slot = 'snack';

      sections[slot].push({
        id: m.id,
        name: m.food_name,
        portion: `${m.portion_size || 1} pháº§n`,
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
        title: 'Bá»¯a sÃ¡ng',
        subtitle: 'Khuyáº¿n nghá»‹ 400 - 550 kcal',
        totalCalories: sections.breakfast.reduce((sum, f) => sum + f.calories, 0),
        items: sections.breakfast,
      },
      {
        slot: 'lunch',
        title: 'Bá»¯a trÆ°a',
        subtitle: 'Khuyáº¿n nghá»‹ 650 - 800 kcal',
        totalCalories: sections.lunch.reduce((sum, f) => sum + f.calories, 0),
        items: sections.lunch,
      },
      {
        slot: 'dinner',
        title: 'Bá»¯a tá»‘i',
        subtitle: 'Khuyáº¿n nghá»‹ 500 - 650 kcal',
        totalCalories: sections.dinner.reduce((sum, f) => sum + f.calories, 0),
        items: sections.dinner,
      },
      {
        slot: 'snack',
        title: 'Bá»¯a phá»¥ & TrÃ¡ng miá»‡ng',
        subtitle: 'Khuyáº¿n nghá»‹ 150 - 250 kcal',
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
        protein: { current: totalProtein, target: 0 },
        carbs: { current: totalCarbs, target: 0 },
        fat: { current: totalFat, target: 0 },
      },
      meals: mealSections,
    };
  }

  async getWeeklyMenu(): Promise<PlannedMealSlotViewModel[]> {
    const raw = await apiClient<any>('/me/nutrition/schedule');
    if (!raw) return [];
    const slots: MealTimeSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    return slots.filter((slot) => typeof raw[slot] === 'string' && raw[slot].trim()).map((slot) => ({
      id: `${raw.id || 'schedule'}-${slot}`,
      dayIndex: 0,
      dayLabel: 'HÃ´m nay',
      mealSlot: slot,
      foodName: raw[slot],
      calories: 0,
      isCompleted: false,
    }));
  }

  async getFoodItem(id: string): Promise<FoodItemViewModel> {
    const raw = await apiClient<any>('/me/nutrition/meals/' + encodeURIComponent(id));
    return {
      id: raw.id,
      name: raw.food_name,
      portion: `${raw.portion_size || 1} pháº§n`,
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
    if (isCompleted) return;
    throw new Error('MÃ¡y chá»§ chÆ°a há»— trá»£ tráº¡ng thÃ¡i hoÃ n thÃ nh cho thá»±c Ä‘Æ¡n.');
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
    const raw = await apiUploadFile<any>(
      '/me/nutrition/scan',
      uri,
      mimeType,
      {}
    );
    return mapScanCandidates(raw);
  }
}

export const apiNutritionRepository = new ApiNutritionRepository();
function mapScanCandidates(raw: any) {
  const topLevelIngredients = Array.isArray(raw?.ingredients) ? uniqueIngredients(raw.ingredients) : [];

  if (Array.isArray(raw?.items) && raw.items.length > 0) {
    return raw.items
      .map((item: any, index: number) => {
        const ingredients = Array.isArray(item?.ingredients) && item.ingredients.length > 0
          ? uniqueIngredients(item.ingredients)
          : topLevelIngredients.length > 0
            ? topLevelIngredients
            : ingredientsFromName(item?.name);
        const portionGrams = totalIngredientGrams(ingredients);
        return toCandidate({
          id: `scan-${index}`,
          name: ingredients.length > 1 ? 'Món ăn quét từ ảnh' : translateIngredientName(item?.name),
          portionDescription: cleanFoodName(item?.portion_description) ||
            cleanFoodName(item?.portion) ||
            (portionGrams > 0 ? `${portionGrams}g trong ảnh` : undefined),
          ingredients: ingredients.length ? ingredients : undefined,
          calories: numberValue(item?.calories),
          protein: numberValue(item?.protein_g),
          carbs: numberValue(item?.carbs_g),
          fat: numberValue(item?.fat_g),
          confidenceScore: numberValue(raw?.confidence),
        });
      })
      .filter(isCandidate);
  }

  if (topLevelIngredients.length > 0) {
    const portionGrams = totalIngredientGrams(topLevelIngredients);

    return [toCandidate({
      id: 'scan-0',
      name: 'Món ăn quét từ ảnh',
      portionDescription: portionGrams > 0 ? `${portionGrams}g trong ảnh` : undefined,
      ingredients: topLevelIngredients,
      calories: numberValue(raw?.calories_kcal),
      protein: numberValue(raw?.protein_g),
      carbs: numberValue(raw?.carbs_g),
      fat: numberValue(raw?.fat_g),
    })].filter(isCandidate);
  }

  return [];
}

function toCandidate(input: {
  id: string;
  name: string;
  portionDescription?: string;
  ingredients?: FoodCandidateIngredientViewModel[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidenceScore?: number;
}) {
  const name = cleanFoodName(input.name);
  if (!name) return null;

  return {
    id: input.id,
    name,
    portionDescription: input.portionDescription || 'Khẩu phần trong ảnh',
    ingredients: input.ingredients,
    calories: input.calories,
    protein: input.protein,
    carbs: input.carbs,
    fat: input.fat,
    confidenceScore: input.confidenceScore,
    selected: true,
  };
}

function isCandidate(value: ReturnType<typeof toCandidate>): value is NonNullable<ReturnType<typeof toCandidate>> {
  return value !== null;
}

function ingredientName(item: any) {
  if (typeof item === 'string') return item;
  return item?.name;
}

function ingredientsFromName(value: any): FoodCandidateIngredientViewModel[] {
  const cleaned = cleanFoodName(value);
  if (!cleaned) return [];
  return uniqueIngredients(
    cleaned
      .split(/\s*,\s*|\s+\band\b\s+/i)
      .map((name) => ({ name, portion_estimate_g: 0 }))
  );
}

function uniqueIngredients(values: any[]): FoodCandidateIngredientViewModel[] {
  const seen = new Set<string>();
  const ingredients: FoodCandidateIngredientViewModel[] = [];
  values.forEach((value, index) => {
    const name = translateIngredientName(ingredientName(value));
    const key = name.toLowerCase().replace(/\s+/g, ' ');
    if (!key || seen.has(key)) return;
    seen.add(key);
    ingredients.push({
      id: `ingredient-${index}`,
      name,
      portionGrams: ingredientPortionGrams(value),
    });
  });
  return ingredients.slice(0, 8);
}

function ingredientPortionGrams(value: any) {
  return numberValue(value?.portion_estimate_g ?? value?.portion_g ?? value?.weight_g ?? value?.grams);
}

function totalIngredientGrams(ingredients: FoodCandidateIngredientViewModel[]) {
  return ingredients.reduce((sum, ingredient) => sum + ingredient.portionGrams, 0);
}
function cleanFoodName(value: any) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\n|\\t/g, ' ')
    .replace(/[\\\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,;:_-]+|[\s.,;:_-]+$/g, '');
}


const INGREDIENT_TRANSLATIONS: Record<string, string> = {
  beef: 'Thịt bò',
  bread: 'Bánh mì',
  chicken: 'Thịt gà',
  carrot: 'Cà rốt',
  cucumber: 'Dưa leo',
  egg: 'Trứng',
  eggs: 'Trứng',
  fish: 'Cá',
  lettuce: 'Xà lách',
  mayonnaise: 'Sốt mayonnaise',
  noodle: 'Mì',
  noodles: 'Mì',
  onion: 'Hành tây',
  pepper: 'Ớt chuông',
  pork: 'Thịt heo',
  rice: 'Cơm',
  'roast beef': 'Thịt bò nướng',
  shrimp: 'Tôm',
  tofu: 'Đậu phụ',
  'vietnamese bread': 'Bánh mì Việt Nam',
  vegetable: 'Rau củ',
  vegetables: 'Rau củ',
};

function translateIngredientName(value: any) {
  const cleaned = cleanFoodName(value);
  if (!cleaned) return '';
  const normalized = cleaned.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (INGREDIENT_TRANSLATIONS[normalized]) return INGREDIENT_TRANSLATIONS[normalized];
  return /[^\x00-\x7F]/.test(cleaned) ? cleaned : 'Thành phần khác';
}
function numberValue(value: any) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}

