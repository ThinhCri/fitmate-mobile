/**
 * Workout & Weight Tracker Types and View Models
 */

export interface ExerciseItemViewModel {
  id: string;
  name: string;
  type: 'reps' | 'time';
  sets: number;
  repsPerSet?: number;
  durationSeconds?: number;
  restSeconds: number;
  caloriesEstimate: number;
  instructions?: string;
  targetMuscle?: string;
}

export interface WorkoutPlanViewModel {
  id: string;
  title: string;
  category: string; // e.g., "Sức mạnh • Thân trên"
  description: string;
  durationMinutes: number;
  caloriesEstimate: number;
  isActive: boolean;
  coachName?: string;
  coachVerified?: boolean;
  coachNotes?: string;
  exercises: ExerciseItemViewModel[];
}

export interface CompletedSetRecord {
  setNumber: number;
  repsCompleted?: number;
  durationSeconds?: number;
  status: 'completed' | 'skipped' | 'partial';
}

export interface CompletedExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  sets: CompletedSetRecord[];
}

export interface WorkoutSessionSummaryViewModel {
  id: string;
  planId: string;
  planTitle: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  caloriesBurned: number;
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  syncStatus: 'synced' | 'pending' | 'failed';
  records: CompletedExerciseRecord[];
}

export interface WeightRecordViewModel {
  id: string;
  weightKg: number;
  recordedAt: string; // ISO string
  notes?: string;
  differenceFromPreviousKg?: number;
}

export interface WorkoutHistoryItemViewModel {
  id: string;
  planId: string;
  planTitle: string;
  category: string;
  completedAt: string;
  durationSeconds: number;
  totalVolumeKg: number;
  caloriesBurned: number;
  completedSets: number;
  totalSets: number;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface AiWorkoutChangeItem {
  id: string;
  exerciseName: string;
  subtitle: string;
  badgeText: string;
  changeType: 'load_increase' | 'reps_adjust' | 'exercise_substitution';
  currentValue: string;
  proposedValue: string;
  reason: string;
  selected: boolean;
}

export interface AiWorkoutAdjustmentProposalViewModel {
  planId: string;
  planTitle: string;
  recoveryScorePercent: number;
  recoveryStatusText: string;
  rationale: string;
  proposedChanges: AiWorkoutChangeItem[];
}
