import { describe, expect, it } from 'vitest';
import { exerciseInputErrors, unusualExercise, wholeNumber } from '../workoutLimits';
const base = { id: 'exercise', name: 'Test', type: 'reps' as const, sets: 3, repsPerSet: 12, restSeconds: 45, caloriesEstimate: 0 };
describe('workout numeric boundaries', () => {
  it.each([0, -1, 101, 100000, 1.5, NaN, Infinity])('rejects invalid rep targets %s', value => {
    expect(exerciseInputErrors({ ...base, repsPerSet: value }).reps).toBeTruthy();
  });
  it('accepts hard boundaries, distinguishes warnings and rejects invalid legacy plans', () => {
    expect(exerciseInputErrors({ ...base, sets: 10, repsPerSet: 100, restSeconds: 600 })).toEqual({});
    expect(exerciseInputErrors({ ...base, type: 'time', durationSeconds: 601 }).duration).toBeTruthy();
    expect(exerciseInputErrors({ ...base, sets: 11 }).sets).toBeTruthy();
    expect(unusualExercise({ ...base, repsPerSet: 51 })).toBe(true);
    expect(unusualExercise(base)).toBe(false);
    expect(wholeNumber(0, 1, 100)).toBe(false);
  });
});
