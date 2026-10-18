import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import { apiNutritionRepository } from './api/apiNutritionRepository';

export interface INutritionRepository {
  getDaySummary(dateString?: string): Promise<DayNutritionSummaryViewModel>;
  getWeeklyMenu(weekStart: string): Promise<PlannedMealSlotViewModel[]>;
  getFoodItem(id: string): Promise<FoodItemViewModel>;
  addFoodItem(item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel>;
  updateFoodItem(id: string, item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel>;
  deleteFoodItem(id: string): Promise<void>;
  addPlannedMeal(item: Omit<PlannedMealSlotViewModel, 'id' | 'isCompleted'>, weekStart: string): Promise<PlannedMealSlotViewModel>;
  updatePlannedMeal(id: string, item: Omit<PlannedMealSlotViewModel, 'id' | 'isCompleted'>, weekStart: string): Promise<PlannedMealSlotViewModel>;
  deletePlannedMeal(id: string): Promise<void>;
  consumePlannedMeal(id: string, date: string): Promise<void>;
  scanMealImage(uri: string, mimeType?: string | null): Promise<import('@/features/nutrition/nutritionTypes').NutritionScanResultViewModel>;
}

export function getNutritionRepository(): INutritionRepository {
  return apiNutritionRepository;
}
