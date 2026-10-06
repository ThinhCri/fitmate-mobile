/**
 * Nutrition View Models & Types
 * Strictly decouples presentation from backend wire format.
 */

export type MealTimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodEntrySource = 'manual' | 'ai_estimated' | 'ai_confirmed' | 'plan';

export interface FoodItemViewModel {
  id: string;
  name: string;
  portion: string; // e.g., "1 tô (250g)"
  grams?: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  source: FoodEntrySource;
  mealSlot: MealTimeSlot;
  loggedAt?: string;
  photoUri?: string;
  notes?: string;
  aiConfidence?: number;
  confirmed?: boolean;
}

export interface MealSectionViewModel {
  slot: MealTimeSlot;
  title: string;
  subtitle: string;
  totalCalories: number;
  items: FoodItemViewModel[];
}

export interface DayNutritionSummaryViewModel {
  dateString: string; // YYYY-MM-DD
  dateDisplay: string; // "Thứ Hai, 28/09/2026"
  isToday: boolean;
  calories: {
    consumed: number;
    target: number;
    burnedExercise: number;
  };
  macros: {
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
  };
  meals: MealSectionViewModel[];
}

export interface FoodCandidateViewModel {
  id: string;
  name: string;
  portionDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams?: number;
  notes?: string;
  confidenceScore?: number; // only if backend provides
  selected: boolean;
}

export interface NutritionScanResultViewModel {
  candidates: FoodCandidateViewModel[];
  ingredients: string[];
}

export interface PlannedMealSlotViewModel {
  id: string;
  dayIndex: number; // 0..6
  dayLabel: string; // T2..CN
  mealSlot: MealTimeSlot;
  foodName: string;
  calories: number;
  portion?: string;
  grams?: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  notes?: string;
  isCompleted: boolean;
  consumedDate?: string;
  mealLogId?: string;
}
