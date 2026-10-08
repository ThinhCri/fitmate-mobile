import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
  ActiveWorkoutResult,
  ExerciseCatalogItemViewModel,
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

export interface WorkoutGoals {
  targetWeightKg: number | null;
  monthlyWorkoutTarget: number | null;
}

export interface IWorkoutRepository {
  listExerciseCatalog(query?: string): Promise<ExerciseCatalogItemViewModel[]>;
  listPlans(): Promise<WorkoutPlanViewModel[]>;
  getPlan(id: string): Promise<WorkoutPlanViewModel>;
  createPlan(plan: Partial<WorkoutPlanViewModel>): Promise<string>;
  updatePlan(id: string, plan: Partial<WorkoutPlanViewModel>): Promise<void>;
  deletePlan(id: string): Promise<void>;
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
  getWorkoutGoals(): Promise<WorkoutGoals>;
  updateWorkoutGoals(goals: Partial<WorkoutGoals>): Promise<WorkoutGoals>;
  recordWorkoutCompletion(params: {
    clientId?: string;
    date?: string;
    planId?: string;
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
    results: ActiveWorkoutResult[];
  }): Promise<string>;
  saveMedicalSurvey(conditions: string[], notes: string): Promise<void>;
}

export function getWorkoutRepository(): IWorkoutRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewWorkoutRepository;
  }
  return apiWorkoutRepository;
}
