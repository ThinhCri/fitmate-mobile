import { describe, expect, it } from 'vitest';

import { setResultLabel } from '../setResultLabel';

describe('setResultLabel', () => {
  it('shows the planned repetitions without claiming a skipped set was performed', () => {
    expect(setResultLabel(
      { setNumber: 1, status: 'skipped' },
      { exerciseId: 'one', exerciseName: 'Squat', plannedReps: 10, sets: [] }
    )).toBe('Mục tiêu: 10 lần');
  });

  it('shows actual repetitions for a completed set', () => {
    expect(setResultLabel(
      { setNumber: 1, status: 'completed', repsCompleted: 8 },
      { exerciseId: 'one', exerciseName: 'Squat', plannedReps: 10, sets: [] }
    )).toBe('8 lần');
  });

  it('never renders null or undefined when the backend has no target', () => {
    expect(setResultLabel(
      { setNumber: 1, status: 'skipped' },
      { exerciseId: 'one', exerciseName: 'Squat', sets: [] }
    )).toBe('Chưa thực hiện');
  });
});
