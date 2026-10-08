import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
  ActiveWorkoutResult,
  ExerciseCatalogItemViewModel,
} from '@/features/workout/workoutTypes';
import type { IWorkoutRepository, MonthlyWorkoutStats, WorkoutGoals } from '../workoutRepository';
import { apiClient } from '@/services/api/client';
import { createUuid } from '@/utils/uuid';

export class ApiWorkoutRepository implements IWorkoutRepository {
  async listExerciseCatalog(query?: string): Promise<ExerciseCatalogItemViewModel[]> {
    const params = new URLSearchParams({ page: '1', pageSize: '100' });
    if (query?.trim()) params.set('query', query.trim());
    const raw = await apiClient<{ items: any[] }>(`/exercises?${params.toString()}`);
    return (raw.items ?? []).map((item) => ({
      id: item.id,
      slug: item.slug,
      nameVi: item.name_vi,
      nameEn: item.name_en,
      type: item.type === 'time' ? 'time' : 'reps',
      difficulty: item.difficulty,
      equipment: item.equipment ?? undefined,
      primaryMuscles: item.primary_muscles ?? [],
      secondaryMuscles: item.secondary_muscles ?? [],
      instructionsVi: item.instructions_vi ?? [],
      imageStartUrl: item.image_start_url ?? undefined,
      imageEndUrl: item.image_end_url ?? undefined,
      source: item.source,
      sourceLicense: item.source_license,
    }));
  }

  private toPlanPayload(plan: Partial<WorkoutPlanViewModel>) {
    return {
      day_of_week: plan.category,
      workout_name: plan.title,
      duration_minutes: plan.durationMinutes,
      target_calories_burn: plan.caloriesEstimate ?? 0,
      exercises: (plan.exercises || []).map((item) => ({
        name: item.name,
        type: item.type,
        sets: item.sets,
        reps: item.repsPerSet,
        duration_sec: item.durationSeconds,
        rest_sec: item.restSeconds,
        calories: item.caloriesEstimate,
        notes: item.instructions,
        media_url: item.imageStartUrl,
        media_type: item.imageStartUrl ? 'image' : undefined,
        media_source: item.mediaSource,
        tags: [item.targetMuscle, item.difficulty, item.equipment].filter(Boolean),
      })),
    };
  }

  async createPlan(plan: Partial<WorkoutPlanViewModel>): Promise<string> {
    const result = await apiClient<{ id: string }>('/me/workout/plans', { method: 'POST', body: JSON.stringify(this.toPlanPayload(plan)) });
    return result.id;
  }

  async updatePlan(id: string, plan: Partial<WorkoutPlanViewModel>): Promise<void> {
    await apiClient(`/me/workout/plans/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(this.toPlanPayload(plan)) });
  }

  async deletePlan(id: string): Promise<void> {
    await apiClient(`/me/workout/plans/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
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
        imageStartUrl: ex.media_url,
        mediaSource: ex.media_source,
        targetMuscle: Array.isArray(ex.tags) ? ex.tags[0] : undefined,
        difficulty: Array.isArray(ex.tags) ? ex.tags[1] : undefined,
        equipment: Array.isArray(ex.tags) ? ex.tags[2] : undefined,
      })),
    };
  }

  async getHistory(): Promise<{
    sessions: WorkoutHistoryItemViewModel[];
    stats: MonthlyWorkoutStats;
  }> {
    const [raw, goals] = await Promise.all([
      apiClient<{ items: any[] }>('/me/workout/sessions'),
      this.getWorkoutGoals(),
    ]);
    const items = raw.items || [];

    let totalVolume = 0;

    const sessions: WorkoutHistoryItemViewModel[] = items.map((item: any) => {
      const durSec = (item.duration_min || 0) * 60;
      const cal = item.calories_burned || 0;

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
        status: item.status === 'ended_early' ? 'endedEarly' : 'completed',
      };
    });

    const now = new Date();
    const monthlySessions = sessions.filter((session) => {
      const date = new Date(session.completedAt);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() && session.status === 'completed';
    });
    const count = monthlySessions.length;
    const avgDuration = count > 0
      ? Math.round(monthlySessions.reduce((sum, session) => sum + session.durationSeconds, 0) / 60 / count)
      : 0;

    const stats: MonthlyWorkoutStats = {
      monthYear: 'Tháng này',
      completedCount: count,
      targetCount: goals.monthlyWorkoutTarget ?? 0,
      totalVolumeKg: totalVolume,
      caloriesBurned: monthlySessions.reduce((sum, session) => sum + session.caloriesBurned, 0),
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
      totalExercises: raw.items?.length ?? raw.exercises ?? 0,
      completedExercises: raw.exercises || 0,
      totalSets: raw.planned_sets || raw.completed_sets || 0,
      completedSets: raw.completed_sets || 0,
      syncStatus: 'synced',
      status: raw.status === 'ended_early' ? 'endedEarly' : 'completed',
      records: (raw.items || []).map((it: any) => ({
        exerciseId: it.id,
        exerciseName: it.exercise_name,
        plannedReps: it.planned_reps,
        plannedDurationSeconds: it.planned_duration_sec,
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
    const goals = await this.getWorkoutGoals();
    const goalWeightKg = goals.targetWeightKg ?? 0;
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

  async getWorkoutGoals(): Promise<WorkoutGoals> {
    const value = await apiClient<{
      target_weight_kg?: number | null;
      monthly_workout_target?: number | null;
    }>('/users/me/preferences');
    return {
      targetWeightKg: value.target_weight_kg ?? null,
      monthlyWorkoutTarget: value.monthly_workout_target ?? null,
    };
  }

  async updateWorkoutGoals(goals: Partial<WorkoutGoals>): Promise<WorkoutGoals> {
    const value = await apiClient<{
      target_weight_kg?: number | null;
      monthly_workout_target?: number | null;
    }>('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify({
        target_weight_kg: goals.targetWeightKg,
        monthly_workout_target: goals.monthlyWorkoutTarget,
      }),
    });
    return {
      targetWeightKg: value.target_weight_kg ?? null,
      monthlyWorkoutTarget: value.monthly_workout_target ?? null,
    };
  }

  async recordWorkoutCompletion(params: {
    clientId?: string;
    date?: string;
    planId?: string;
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
    results: ActiveWorkoutResult[];
  }): Promise<string> {
    const dateStr = params.date ?? new Date().toISOString().slice(0, 10);
    const clientId = params.clientId ?? createUuid();
    const result = await apiClient<{ id: string }>('/me/workout/sessions', {
      method: 'POST',
      headers: { 'Idempotency-Key': clientId },
      body: JSON.stringify({
        client_id: clientId,
        plan_id: params.planId,
        date: dateStr,
        duration_min: params.durationMinutes,
        calories_burned: params.caloriesBurned,
        exercises: params.results.filter((item) =>
          item.sets.some((set) => set.status === 'completed' || set.status === 'partial')
        ).length,
        status: params.status === 'completed' ? 'completed' : 'ended_early',
        completed_sets: params.completedSets,
        planned_sets: params.plannedSets,
        exercise_items: params.results.map((item, exerciseIndex) => ({
          exercise_id: item.exerciseId,
          order_index: exerciseIndex,
          sets: item.sets.map((set) => ({
            set_index: set.setNumber,
            status: set.status,
            actual_reps: set.repsCompleted,
            actual_duration_sec: set.durationSeconds,
          })),
        })),
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
