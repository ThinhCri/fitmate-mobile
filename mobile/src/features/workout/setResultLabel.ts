import type { CompletedExerciseRecord, CompletedSetRecord } from './workoutTypes';

export function setResultLabel(set: CompletedSetRecord, exercise: CompletedExerciseRecord): string {
  if (set.status === 'skipped') {
    if (exercise.plannedReps != null) return `Mục tiêu: ${exercise.plannedReps} lần`;
    if (exercise.plannedDurationSeconds != null) return `Mục tiêu: ${exercise.plannedDurationSeconds} giây`;
    return 'Chưa thực hiện';
  }
  if (set.repsCompleted != null) return `${set.repsCompleted} lần`;
  if (set.durationSeconds != null) return `${set.durationSeconds} giây`;
  return 'Chưa ghi nhận kết quả';
}
