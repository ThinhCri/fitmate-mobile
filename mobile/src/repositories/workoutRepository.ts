import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
} from '@/features/workout/workoutTypes';
import { getDataSourceMode } from './repositoryTypes';
import { apiWorkoutRepository } from './api/apiWorkoutRepository';
import { previewWorkoutRepository } from './preview/previewWorkoutRepository';

export interface MonthlyWorkoutStats {
  monthYear: string;
  completedCount: number;
  targetCount: number;
  totalVolumeKg: number;
  caloriesBurned: number;
  averageDurationMinutes: number;
}

export interface IWorkoutRepository {
  getPlan(id: string): Promise<WorkoutPlanViewModel>;
  getHistory(): Promise<{
    sessions: WorkoutHistoryItemViewModel[];
    stats: MonthlyWorkoutStats;
  }>;
  getSessionDetail(id: string): Promise<WorkoutSessionSummaryViewModel>;
  getWeightRecords(): Promise<{
    records: WeightRecordViewModel[];
    currentWeightKg: number;
    goalWeightKg: number;
    changeLast7DaysKg: number;
  }>;
  addWeightRecord(weightKg: number, notes?: string): Promise<WeightRecordViewModel>;
  deleteWeightRecord(id: string): Promise<void>;
  recordWorkoutCompletion(params: {
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
  }): Promise<void>;
  saveMedicalSurvey(conditions: string[], notes: string): Promise<void>;
}

export function getWorkoutRepository(): IWorkoutRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewWorkoutRepository;
  }
  return apiWorkoutRepository;
}
