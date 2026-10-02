import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
} from '@/features/workout/workoutTypes';
import type { IWorkoutRepository, MonthlyWorkoutStats } from '../workoutRepository';
import { apiClient } from '@/services/api/client';

export class ApiWorkoutRepository implements IWorkoutRepository {
  async getPlan(id: string): Promise<WorkoutPlanViewModel> {
    const raw = await apiClient<any>('/me/workout/plans/' + encodeURIComponent(id));
    return {
      id: raw.id,
      title: raw.name || raw.title || 'Giáo án tập luyện',
      category: raw.category || 'Sức mạnh & Thể hình',
      description: raw.description || '',
      durationMinutes: raw.duration_minutes || 45,
      caloriesEstimate: raw.target_calories_burn || 250,
      isActive: Boolean(raw.is_active ?? true),
      coachName: raw.coach_name,
      coachVerified: true,
      coachNotes: raw.coach_notes,
      exercises: (raw.exercises || []).map((ex: any, idx: number) => ({
        id: ex.id || `ex-${idx}`,
        name: ex.name,
        type: ex.type === 'time' ? 'time' : 'reps',
        sets: ex.sets || 3,
        repsPerSet: ex.reps,
        durationSeconds: ex.duration_sec,
        restSeconds: ex.rest_sec || 60,
        caloriesEstimate: ex.calories || 50,
        instructions: ex.instructions,
        targetMuscle: ex.target_muscle,
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
      totalVolume += (item.completed_sets || 0) * 50;

      return {
        id: item.id,
        planId: item.plan_id || 'plan-default',
        planTitle: item.day || 'Buổi tập toàn thân',
        category: 'Thể lực & Sức mạnh',
        completedAt: item.date || item.created_at || new Date().toISOString(),
        durationSeconds: durSec,
        totalVolumeKg: (item.completed_sets || 0) * 50,
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
      targetCount: 16,
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

    const currentWeightKg = records.length > 0 ? records[0].weightKg : 67.8;
    const goalWeightKg = 65.0;
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
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
  }): Promise<void> {
    const dateStr = new Date().toISOString().slice(0, 10);
    const clientId =
      'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    await apiClient('/me/workout/sessions', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        date: dateStr,
        duration_min: params.durationMinutes,
        calories_burned: params.caloriesBurned,
        exercises: Math.max(1, Math.round(params.completedSets / 3)),
        status: params.status === 'completed' ? 'completed' : 'ended_early',
        completed_sets: params.completedSets,
        planned_sets: params.plannedSets,
      }),
    });
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
