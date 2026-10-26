import type { ExerciseItemViewModel } from './workoutTypes';

export function wholeNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}
export function exerciseInputErrors(exercise: ExerciseItemViewModel): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!wholeNumber(exercise.sets, 1, 10)) errors.sets = 'Nhập từ 1 đến 10 hiệp';
  if (exercise.type === 'reps' && !wholeNumber(exercise.repsPerSet, 1, 100)) errors.reps = 'Nhập từ 1 đến 100 lần';
  if (exercise.type === 'time' && !wholeNumber(exercise.durationSeconds, 1, 600)) errors.duration = 'Nhập từ 1 đến 600 giây';
  if (!wholeNumber(exercise.restSeconds, 0, 600)) errors.rest = 'Nhập từ 0 đến 600 giây';
  return errors;
}
export function unusualExercise(exercise: ExerciseItemViewModel): boolean {
  return exercise.sets > 6 || (exercise.type === 'reps' ? (exercise.repsPerSet ?? 0) > 50 : (exercise.durationSeconds ?? 0) > 300) || exercise.restSeconds > 300;
}
