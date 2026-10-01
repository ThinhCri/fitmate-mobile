import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  PlannedMealSlotViewModel,
} from '@/features/nutrition/nutritionTypes';
import type { INutritionRepository } from '../nutritionRepository';
import { ApiError } from '@/services/api/client';

export class ApiNutritionRepository implements INutritionRepository {
  async getDaySummary(_dateString?: string): Promise<DayNutritionSummaryViewModel> {
    throw new ApiError('Nutrition diary API endpoint not available', 501);
  }

  async getWeeklyMenu(): Promise<PlannedMealSlotViewModel[]> {
    throw new ApiError('Weekly nutrition menu API endpoint not available', 501);
  }

  async getFoodItem(id: string): Promise<FoodItemViewModel> {
    throw new ApiError(`Food item API endpoint for ${id} not available`, 501);
  }

  async addFoodItem(_item: Omit<FoodItemViewModel, 'id'>): Promise<FoodItemViewModel> {
    throw new ApiError('Add food item API endpoint not available', 501);
  }

  async deleteFoodItem(_id: string): Promise<void> {
    throw new ApiError('Delete food item API endpoint not available', 501);
  }

  async updatePlannedSlot(_slotId: string, _isCompleted: boolean): Promise<void> {
    throw new ApiError('Update planned meal slot API endpoint not available', 501);
  }
}

export const apiNutritionRepository = new ApiNutritionRepository();
