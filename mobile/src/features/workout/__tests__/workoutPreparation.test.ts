import { describe, expect, it } from 'vitest';

import { estimateSessionKcal } from '../calorieEstimate';
import { bodyweightAlternatives, equipmentLabel, findCatalogMatch, isBodyweight } from '../workoutCatalog';
import type { ExerciseCatalogItemViewModel, ExerciseItemViewModel } from '../workoutTypes';

const exercise: ExerciseItemViewModel = {
  id: 'planned', name: 'Squat với thanh đòn', type: 'reps', sets: 3,
  repsPerSet: 10, restSeconds: 45, caloriesEstimate: 0,
  targetMuscle: 'quadriceps', equipment: 'barbell',
};

const catalog: ExerciseCatalogItemViewModel[] = [{
  id: 'bodyweight', slug: 'bodyweight-squat', nameVi: 'Squat không tạ',
  nameEn: 'Bodyweight Squat', type: 'reps', difficulty: 'beginner',
  equipment: 'body only', primaryMuscles: ['quadriceps'], secondaryMuscles: [],
  instructionsVi: ['Đẩy hông ra sau.'], source: 'free-exercise-db', sourceLicense: 'Unlicense',
}];

describe('workout preparation', () => {
  it('offers only same-muscle bodyweight substitutions', () => {
    expect(bodyweightAlternatives(exercise, catalog).map((item) => item.id)).toEqual(['bodyweight']);
    expect(isBodyweight('body only')).toBe(true);
    expect(equipmentLabel('barbell')).toBe('Thanh đòn');
  });

  it('matches catalog exercise by Vietnamese name when plan stores no catalog ID', () => {
    expect(findCatalogMatch({ ...exercise, name: 'Squat không tạ' }, catalog)?.imageEndUrl).toBeUndefined();
    expect(findCatalogMatch({ ...exercise, name: 'Squat không tạ' }, catalog)?.id).toBe('bodyweight');
  });
  it('refreshes media for plans saved with an English catalog name or slug', () => {
    const withMedia = [{ ...catalog[0], imageStartUrl: 'https://media.example/start.jpg', imageEndUrl: 'https://media.example/end.jpg' }];
    expect(findCatalogMatch({ ...exercise, name: 'Bodyweight Squat' }, withMedia)?.imageEndUrl).toBe('https://media.example/end.jpg');
    expect(findCatalogMatch({ ...exercise, name: 'bodyweight-squat' }, withMedia)?.imageStartUrl).toBe('https://media.example/start.jpg');
    expect(findCatalogMatch({ ...exercise, name: 'Different exercise' }, withMedia)).toBeUndefined();
  });

  it('uses actual repetitions, not planned repetitions, for calorie estimates', () => {
    const completed = [{ exerciseId: 'planned', sets: [1, 2, 3].map((setNumber) => ({
      setNumber, repsCompleted: 10, status: 'completed' as const,
    })) }];
    const fewerReps = [{ exerciseId: 'planned', sets: [1, 2, 3].map((setNumber) => ({
      setNumber, repsCompleted: 8, status: 'completed' as const,
    })) }];
    expect(estimateSessionKcal([exercise], fewerReps, 70)).toBeLessThan(
      estimateSessionKcal([exercise], completed, 70)
    );
    expect(estimateSessionKcal([exercise], completed, 0)).toBe(0);
  });
});
