import { describe, it, expect } from 'vitest';
import {
  WorkoutPlanViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
  AiWorkoutAdjustmentProposalViewModel,
} from '../workoutTypes';

describe('Workout & Weight Tracker Flow Logic', () => {
  it('calculates workout plan volume and metrics correctly', () => {
    const plan: WorkoutPlanViewModel = {
      id: 'test-p1',
      title: 'Strength A',
      category: 'Compound',
      description: 'Test plan',
      durationMinutes: 45,
      caloriesEstimate: 300,
      isActive: true,
      exercises: [
        {
          id: 'ex-1',
          name: 'Bench Press',
          type: 'reps',
          sets: 4,
          repsPerSet: 10,
          restSeconds: 90,
          caloriesEstimate: 120,
        },
        {
          id: 'ex-2',
          name: 'Plank',
          type: 'time',
          sets: 3,
          durationSeconds: 60,
          restSeconds: 45,
          caloriesEstimate: 60,
        },
      ],
    };

    const totalSets = plan.exercises.reduce((sum, e) => sum + e.sets, 0);
    expect(totalSets).toBe(7);
    expect(plan.exercises.length).toBe(2);
    expect(plan.durationMinutes).toBe(45);
  });

  it('verifies session completion summary calculations and sync state', () => {
    const summary: WorkoutSessionSummaryViewModel = {
      id: 'ses-101',
      planId: 'test-p1',
      planTitle: 'Strength A',
      startedAt: '18:00',
      endedAt: '18:45',
      durationSeconds: 2700,
      caloriesBurned: 310,
      totalExercises: 2,
      completedExercises: 2,
      totalSets: 7,
      completedSets: 6,
      syncStatus: 'pending',
      records: [
        {
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, repsCompleted: 10, status: 'completed' },
            { setNumber: 2, repsCompleted: 10, status: 'completed' },
            { setNumber: 3, repsCompleted: 10, status: 'completed' },
            { setNumber: 4, repsCompleted: 9, status: 'completed' },
          ],
        },
        {
          exerciseId: 'ex-2',
          exerciseName: 'Plank',
          sets: [
            { setNumber: 1, durationSeconds: 60, status: 'completed' },
            { setNumber: 2, durationSeconds: 60, status: 'completed' },
            { setNumber: 3, status: 'skipped' },
          ],
        },
      ],
    };

    expect(summary.completedSets).toBe(6);
    expect(summary.totalSets).toBe(7);
    expect(summary.syncStatus).toBe('pending');

    const completedInRecords = summary.records.reduce(
      (acc, r) => acc + r.sets.filter((s) => s.status === 'completed').length,
      0
    );
    expect(completedInRecords).toBe(summary.completedSets);
  });

  it('computes weight differences and bounds accurately', () => {
    const records: WeightRecordViewModel[] = [
      { id: 'w1', weightKg: 67.8, recordedAt: '2026-09-30' },
      { id: 'w2', weightKg: 68.2, recordedAt: '2026-09-23' },
    ];

    const diff = Number((records[0].weightKg - records[1].weightKg).toFixed(1));
    expect(diff).toBe(-0.4);

    const goalWeight = 65.0;
    const remaining = Number((records[0].weightKg - goalWeight).toFixed(1));
    expect(remaining).toBe(2.8);
  });

  it('filters selected AI workout adjustment proposals correctly', () => {
    const proposal: AiWorkoutAdjustmentProposalViewModel = {
      planId: 'plan-1',
      planTitle: 'Upper Body A',
      recoveryScorePercent: 84,
      recoveryStatusText: 'Cơ bắp sẵn sàng chịu tải (+72h nghỉ)',
      rationale: 'Kích thích lũy tiến an toàn.',
      proposedChanges: [
        {
          id: 'c-1',
          exerciseName: 'Bench Press',
          subtitle: 'Tăng tải 5%',
          badgeText: '+5% Tải',
          changeType: 'load_increase',
          currentValue: '50 kg',
          proposedValue: '52.5 kg',
          reason: 'RPE < 7',
          selected: true,
        },
        {
          id: 'c-2',
          exerciseName: 'Dips',
          subtitle: 'Thay bài hít đất',
          badgeText: 'Thay bài',
          changeType: 'exercise_substitution',
          currentValue: 'Dips',
          proposedValue: 'Push-up',
          reason: 'Bảo vệ khớp vai',
          selected: false,
        },
      ],
    };

    const initialSelected = proposal.proposedChanges.filter((c) => c.selected).map((c) => c.id);
    expect(initialSelected).toEqual(['c-1']);
    expect(proposal.recoveryScorePercent).toBeGreaterThanOrEqual(80);
  });
});
