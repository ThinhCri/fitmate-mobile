import type { ActiveWorkoutResult, ExerciseItemViewModel } from './workoutTypes';

// Approximation for general moderate resistance exercise (3.5 MET).
// 1 MET is approximately 1 kcal/kg/hour. Repetition duration is assumed
// to be 3 seconds; rest is excluded. This is not a measured calorie count.
const MODERATE_RESISTANCE_MET = 3.5;

export function estimateExerciseKcal(
  exercise: Pick<ExerciseItemViewModel, 'type' | 'sets' | 'repsPerSet' | 'durationSeconds'>,
  weightKg: number,
  completedSets = exercise.sets
): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return 0;
  const secondsPerSet = exercise.type === 'time'
    ? exercise.durationSeconds ?? 0
    : (exercise.repsPerSet ?? 0) * 3;
  const activeMinutes = Math.max(0, secondsPerSet) * Math.max(0, completedSets) / 60;
  return Math.round(MODERATE_RESISTANCE_MET * weightKg * activeMinutes / 60);
}

export function estimatePlanKcal(exercises: ExerciseItemViewModel[], weightKg: number): number {
  return exercises.reduce((sum, exercise) => sum + estimateExerciseKcal(exercise, weightKg), 0);
}

export function estimateSessionKcal(
  exercises: ExerciseItemViewModel[],
  results: ActiveWorkoutResult[],
  weightKg: number
): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return 0;
  const activeSeconds = exercises.reduce((total, exercise) => {
    const recorded = results.find((result) => result.exerciseId === exercise.id);
    return total + (recorded?.sets ?? []).reduce((seconds, set) => {
      if (set.status === 'skipped') return seconds;
      const duration = exercise.type === 'time'
        ? set.durationSeconds ?? 0
        : (set.repsCompleted ?? 0) * 3;
      return seconds + Math.max(0, duration);
    }, 0);
  }, 0);
  return Math.round(MODERATE_RESISTANCE_MET * weightKg * activeSeconds / 3600);
}
