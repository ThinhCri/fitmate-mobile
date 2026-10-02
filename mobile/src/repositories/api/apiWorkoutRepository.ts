import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
} from '@/features/workout/workoutTypes';
import type { IWorkoutRepository, MonthlyWorkoutStats } from '../workoutRepository';
import { apiClient } from '@/services/api/client';

export class ApiWorkoutRepository implements IWorkoutRepository {
  async listPlans(): Promise<WorkoutPlanViewModel[]> {
    const raw = await apiClient<{
      items: Array<{
        id: string;
        day_of_week: string;
        workout_name: string;
        duration_minutes: number;
        target_calories_burn: number;
        is_completed: boolean;
        exercise_count: number;
      }>;
    }>('/me/workout/plans');

    return (raw.items || []).map((plan) => ({
      id: plan.id,
      title: plan.workout_name,
      category: plan.day_of_week,
      description: `${plan.exercise_count} bài tập`,
      durationMinutes: plan.duration_minutes,
      caloriesEstimate: plan.target_calories_burn,
      isActive: !plan.is_completed,
      exercises: [],
    }));
  }

  async getPlan(id: string): Promise<WorkoutPlanViewModel> {
    const raw = await apiClient<any>('/me/workout/plans/' + encodeURIComponent(id));
    return {
      id: raw.id,
      title: raw.workout_name,
      category: raw.day_of_week,
      description: `${(raw.exercises || []).length} bài tập`,
      durationMinutes: raw.duration_minutes ?? 0,
      caloriesEstimate: raw.target_calories_burn ?? 0,
      isActive: !raw.is_completed,
      exercises: (raw.exercises || []).map((ex: any, idx: number) => ({
        id: ex.id || `${id}-${idx}`,
        name: ex.name,
        type: ex.type === 'time' ? 'time' : 'reps',
        sets: ex.sets ?? 0,
        repsPerSet: ex.reps,
        durationSeconds: ex.duration_sec,
        restSeconds: ex.rest_sec ?? 0,
        caloriesEstimate: ex.calories ?? 0,
        instructions: ex.notes,
      })),
    };
  }

  async getHistory(): Promise<{
    sessions: WorkoutHistoryItemViewModel[];
    stats: MonthlyWorkoutStats;
  }> {
    const raw = await apiClient<{ items: any[] }>('/me/workout/sessions');
    const items = raw.items || [];

    let totalVolume = 0;
    let totalCalories = 0;
    let totalDuration = 0;

    const sessions: WorkoutHistoryItemViewModel[] = items.map((item: any) => {
      const durSec = (item.duration_min || 0) * 60;
      const cal = item.calories_burned || 0;
      totalCalories += cal;
      totalDuration += item.duration_min || 0;

      return {
        id: item.id,
        planId: item.plan_id || '',
        planTitle: item.plan_name || item.day || 'Buổi tập',
        category: item.snapshot_plan_day_of_week || item.day || '',
        completedAt: item.created_at || item.date,
        durationSeconds: durSec,
        totalVolumeKg: 0,
        caloriesBurned: cal,
        completedSets: item.completed_sets || 0,
        totalSets: item.planned_sets || item.completed_sets || 0,
        syncStatus: 'synced',
      };
    });

    const count = sessions.length;
    const avgDuration = count > 0 ? Math.round(totalDuration / count) : 0;

    const stats: MonthlyWorkoutStats = {
      monthYear: 'Tháng này',
      completedCount: count,
      targetCount: 0,
      totalVolumeKg: totalVolume,
      caloriesBurned: totalCalories,
      averageDurationMinutes: avgDuration,
    };

    return { sessions, stats };
  }

  async getSessionDetail(id: string): Promise<WorkoutSessionSummaryViewModel> {
    const raw = await apiClient<any>('/me/workout/sessions/' + encodeURIComponent(id));
    return {
      id: raw.id,
      planId: raw.plan_id || '',
      planTitle: raw.plan_name || raw.day || 'Chi tiết buổi tập',
      startedAt: raw.created_at || raw.date,
      endedAt: raw.created_at || raw.date,
      durationSeconds: (raw.duration_min || 0) * 60,
      caloriesBurned: raw.calories_burned || 0,
      totalExercises: raw.exercises || 0,
      completedExercises: raw.exercises || 0,
      totalSets: raw.planned_sets || raw.completed_sets || 0,
      completedSets: raw.completed_sets || 0,
      syncStatus: 'synced',
      records: (raw.items || []).map((it: any) => ({
        exerciseId: it.id,
        exerciseName: it.exercise_name,
        sets: (it.set_results || []).map((s: any, idx: number) => ({
          setNumber: s.set_index || idx + 1,
          repsCompleted: s.actual_reps,
          durationSeconds: s.actual_duration_sec,
          status:
            s.status === 'completed'
              ? 'completed'
              : s.status === 'partial'
                ? 'partial'
                : 'skipped',
        })),
      })),
    };
  }

  async getWeightRecords(): Promise<{
    records: WeightRecordViewModel[];
    currentWeightKg: number;
    goalWeightKg: number;
    changeLast7DaysKg: number;
  }> {
    const raw = await apiClient<{
      items: Array<{ id: string; weight_kg: number; recorded_at: string }>;
    }>('/me/weight');
    const items = raw.items || [];

    const records: WeightRecordViewModel[] = items.map((it, idx) => {
      const prev = items[idx + 1];
      const diff = prev
        ? Math.round((it.weight_kg - prev.weight_kg) * 10) / 10
        : undefined;
      return {
        id: it.id,
        weightKg: it.weight_kg,
        recordedAt: it.recorded_at,
        differenceFromPreviousKg: diff,
      };
    });

    const currentWeightKg = records.length > 0 ? records[0].weightKg : 0;
    const goalWeightKg = 0;
    const changeLast7DaysKg =
      records.length > 1
        ? Math.round(
            (records[0].weightKg -
              records[Math.min(records.length - 1, 6)].weightKg) *
              10
          ) / 10
        : 0;

    return {
      records,
      currentWeightKg,
      goalWeightKg,
      changeLast7DaysKg,
    };
  }

  async addWeightRecord(
    weightKg: number,
    notes?: string
  ): Promise<WeightRecordViewModel> {
    const raw = await apiClient<{
      id: string;
      weight_kg: number;
      recorded_at: string;
    }>('/me/weight', {
      method: 'POST',
      body: JSON.stringify({
        weight_kg: weightKg,
        recorded_at: new Date().toISOString(),
      }),
    });
    return {
      id: raw.id,
      weightKg: raw.weight_kg,
      recordedAt: raw.recorded_at,
      notes,
    };
  }

  async deleteWeightRecord(id: string): Promise<void> {
    await apiClient('/me/weight/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  async recordWorkoutCompletion(params: {
    planId?: string;
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
  }): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10);
    const clientId =
      'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const result = await apiClient<{ id: string }>('/me/workout/sessions', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        plan_id: params.planId,
        date: dateStr,
        duration_min: params.durationMinutes,
        calories_burned: params.caloriesBurned,
        exercises: Math.max(1, Math.round(params.completedSets / 3)),
        status: params.status === 'completed' ? 'completed' : 'ended_early',
        completed_sets: params.completedSets,
        planned_sets: params.plannedSets,
      }),
    });
    return result.id;
  }

  async saveMedicalSurvey(conditions: string[], notes: string): Promise<void> {
    await apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        medical_conditions: conditions,
        notes,
      }),
    });
  }
}

export const apiWorkoutRepository = new ApiWorkoutRepository();
