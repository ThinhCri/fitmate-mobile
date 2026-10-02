import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import { getDataSourceMode } from './repositoryTypes';
import { apiNutritionRepository } from './api/apiNutritionRepository';
import { previewNutritionRepository } from './preview/previewNutritionRepository';

export interface INutritionRepository {
  getDaySummary(dateString?: string): Promise<DayNutritionSummaryViewModel>;
  getWeeklyMenu(): Promise<PlannedMealSlotViewModel[]>;
  getFoodItem(id: string): Promise<FoodItemViewModel>;
  addFoodItem(item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel>;
  deleteFoodItem(id: string): Promise<void>;
  updatePlannedSlot(slotId: string, isCompleted: boolean): Promise<void>;
  scanMealImage(uri: string): Promise<import('@/features/nutrition/nutritionTypes').FoodCandidateViewModel[]>;
}

export function getNutritionRepository(): INutritionRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewNutritionRepository;
  }
  return apiNutritionRepository;
}
