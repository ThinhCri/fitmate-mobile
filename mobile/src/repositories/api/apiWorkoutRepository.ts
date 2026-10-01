import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
} from '@/features/workout/workoutTypes';
import type { IWorkoutRepository, MonthlyWorkoutStats } from '../workoutRepository';
import { ApiError } from '@/services/api/client';

export class ApiWorkoutRepository implements IWorkoutRepository {
  async getPlan(id: string): Promise<WorkoutPlanViewModel> {
    // Workout plan API not yet verified in backend baseline PROD-2026-09-22-v1.
    // Fails closed with standard ApiError instead of returning mock data.
    throw new ApiError(`Workout plan API endpoint for ${id} not available`, 501);
  }

  async getHistory(): Promise<{
    sessions: WorkoutHistoryItemViewModel[];
    stats: MonthlyWorkoutStats;
  }> {
    throw new ApiError('Workout history API endpoint not available', 501);
  }

  async getSessionDetail(id: string): Promise<WorkoutSessionSummaryViewModel> {
    throw new ApiError(`Workout session detail API endpoint for ${id} not available`, 501);
  }

  async getWeightRecords(): Promise<{
    records: WeightRecordViewModel[];
    currentWeightKg: number;
    goalWeightKg: number;
    changeLast7DaysKg: number;
  }> {
    throw new ApiError('Weight tracking API endpoint not available', 501);
  }

  async addWeightRecord(_weightKg: number, _notes?: string): Promise<WeightRecordViewModel> {
    throw new ApiError('Add weight record API endpoint not available', 501);
  }

  async deleteWeightRecord(_id: string): Promise<void> {
    throw new ApiError('Delete weight record API endpoint not available', 501);
  }

  async recordWorkoutCompletion(_params: {
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
  }): Promise<void> {
    throw new ApiError('Record workout completion API endpoint not available', 501);
  }

  async saveMedicalSurvey(_conditions: string[], _notes: string): Promise<void> {
    throw new ApiError('Save medical survey API endpoint not available', 501);
  }
}

export const apiWorkoutRepository = new ApiWorkoutRepository();
