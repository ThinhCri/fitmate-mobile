import type { ExerciseCatalogItemViewModel, ExerciseItemViewModel } from './workoutTypes';

export function isBodyweight(equipment?: string): boolean {
  const value = equipment?.trim().toLowerCase();
  return !value || value === 'body only' || value === 'none' || value === 'không dụng cụ';
}

export function equipmentLabel(equipment?: string): string {
  const value = equipment?.trim().toLowerCase();
  if (isBodyweight(value)) return 'Không cần dụng cụ';
  const labels: Record<string, string> = {
    dumbbell: 'Tạ đơn', barbell: 'Thanh đòn', kettlebell: 'Tạ ấm',
    cable: 'Máy kéo cáp', machine: 'Máy tập', bands: 'Dây kháng lực',
    'medicine ball': 'Bóng tạ', 'exercise ball': 'Bóng tập', other: 'Dụng cụ khác',
  };
  return labels[value ?? ''] ?? equipment ?? 'Dụng cụ khác';
}

export function findCatalogMatch(
  exercise: ExerciseItemViewModel,
  catalog: ExerciseCatalogItemViewModel[]
): ExerciseCatalogItemViewModel | undefined {
  return catalog.find((item) => item.id === exercise.catalogId) ??
    catalog.find((item) => [item.nameVi, item.nameEn, item.slug].some(
      name => name.trim().toLowerCase() === exercise.name.trim().toLowerCase()
    ));
}

export function bodyweightAlternatives(
  exercise: ExerciseItemViewModel,
  catalog: ExerciseCatalogItemViewModel[]
): ExerciseCatalogItemViewModel[] {
  const muscle = exercise.targetMuscle?.toLowerCase();
  if (!muscle) return [];
  return catalog.filter((item) =>
    isBodyweight(item.equipment) &&
    item.nameVi !== exercise.name &&
    item.primaryMuscles.some((value) => value.toLowerCase() === muscle)
  ).slice(0, 3);
}
