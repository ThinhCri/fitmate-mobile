import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import type { INutritionRepository } from '../nutritionRepository';

let previewSummary: DayNutritionSummaryViewModel = {
  dateString: '2026-09-28',
  dateDisplay: 'Thứ Hai, 28/09/2026',
  isToday: true,
  calories: {
    consumed: 1450,
    target: 2000,
    burnedExercise: 250,
  },
  macros: {
    protein: { current: 110, target: 140 },
    carbs: { current: 165, target: 220 },
    fat: { current: 42, target: 65 },
  },
  meals: [
    {
      slot: 'breakfast',
      title: 'Bữa sáng',
      subtitle: 'Khởi đầu ngày mới',
      totalCalories: 385,
      items: [
        {
          id: 'b1',
          name: 'Yến mạch nấu sữa hạnh nhân',
          portion: '1 tô (250g)',
          calories: 260,
          proteinGrams: 9,
          carbsGrams: 42,
          fatGrams: 6,
          source: 'manual',
          mealSlot: 'breakfast',
        },
        {
          id: 'b2',
          name: 'Chuối già Nam Mỹ',
          portion: '1 quả (120g)',
          calories: 125,
          proteinGrams: 1,
          carbsGrams: 30,
          fatGrams: 0,
          source: 'ai_confirmed',
          mealSlot: 'breakfast',
        },
      ],
    },
    {
      slot: 'lunch',
      title: 'Bữa trưa',
      subtitle: 'Năng lượng chính trong ngày',
      totalCalories: 645,
      items: [
        {
          id: 'l1',
          name: 'Cơm gạo lứt huyết rồng',
          portion: '1 chén (150g)',
          calories: 165,
          proteinGrams: 4,
          carbsGrams: 35,
          fatGrams: 1,
          source: 'manual',
          mealSlot: 'lunch',
        },
        {
          id: 'l2',
          name: 'Ức gà nướng mật ong',
          portion: '1 miếng (150g)',
          calories: 247,
          proteinGrams: 36,
          carbsGrams: 8,
          fatGrams: 5,
          source: 'ai_confirmed',
          mealSlot: 'lunch',
        },
      ],
    },
    {
      slot: 'dinner',
      title: 'Bữa tối',
      subtitle: 'Nhẹ nhàng trước khi ngủ',
      totalCalories: 420,
      items: [
        {
          id: 'd1',
          name: 'Salad ức gà xé dầu giấm',
          portion: '1 đĩa (200g)',
          calories: 280,
          proteinGrams: 28,
          carbsGrams: 10,
          fatGrams: 8,
          source: 'manual',
          mealSlot: 'dinner',
        },
      ],
    },
    {
      slot: 'snack',
      title: 'Bữa phụ',
      subtitle: 'Phục hồi sau tập',
      totalCalories: 0,
      items: [],
    },
  ],
};

let previewWeeklyMenu: PlannedMealSlotViewModel[] = [
  {
    id: 'm1',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'breakfast',
    foodName: 'Cháo yến mạch sữa hạt & quả mọng',
    calories: 320,
    isCompleted: true,
  },
  {
    id: 'm2',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'lunch',
    foodName: 'Cơm gạo lứt + ức gà áp chảo + rau củ luộc',
    calories: 580,
    isCompleted: true,
  },
  {
    id: 'm3',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'dinner',
    foodName: 'Salad cá hồi áp chảo dầu ô liu',
    calories: 420,
    isCompleted: false,
  },
  {
    id: 'm4',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'snack',
    foodName: 'Sữa chua Hy Lạp + hạnh nhân',
    calories: 160,
    isCompleted: false,
  },
];

export class PreviewNutritionRepository implements INutritionRepository {
  async scanMealImage(_uri: string) {
    return [];
  }
  async getDaySummary(_dateString?: string): Promise<DayNutritionSummaryViewModel> {
    return JSON.parse(JSON.stringify(previewSummary));
  }

  async getWeeklyMenu(): Promise<PlannedMealSlotViewModel[]> {
    return JSON.parse(JSON.stringify(previewWeeklyMenu));
  }

  async getFoodItem(id: string): Promise<FoodItemViewModel> {
    for (const meal of previewSummary.meals) {
      const found = meal.items.find((i) => i.id === id);
      if (found) return found;
    }
    return {
      id,
      name: 'Ức gà nướng mật ong',
      portion: '1 khẩu phần (150g)',
      calories: 247,
      proteinGrams: 36,
      carbsGrams: 8,
      fatGrams: 5,
      source: 'ai_confirmed',
      mealSlot: 'lunch',
      notes: 'Ướp sốt mật ong mù tạt, nướng nồi chiên không dầu',
    };
  }

  async addFoodItem(item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel> {
    const newItem: FoodItemViewModel = {
      ...item,
      id: `food-${Date.now()}`,
    };
    const meal = previewSummary.meals.find((m) => m.slot === item.mealSlot);
    if (meal) {
      meal.items.push(newItem);
      meal.totalCalories += newItem.calories;
      previewSummary.calories.consumed += newItem.calories;
    }
    return newItem;
  }

  async deleteFoodItem(id: string): Promise<void> {
    for (const meal of previewSummary.meals) {
      const idx = meal.items.findIndex((i) => i.id === id);
      if (idx !== -1) {
        const item = meal.items[idx];
        meal.totalCalories = Math.max(0, meal.totalCalories - item.calories);
        previewSummary.calories.consumed = Math.max(0, previewSummary.calories.consumed - item.calories);
        meal.items.splice(idx, 1);
        break;
      }
    }
  }

  async updatePlannedSlot(slotId: string, isCompleted: boolean): Promise<void> {
    const slot = previewWeeklyMenu.find((s) => s.id === slotId);
    if (slot) {
      slot.isCompleted = isCompleted;
    }
  }
}

export const previewNutritionRepository = new PreviewNutritionRepository();
