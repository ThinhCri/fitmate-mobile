import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { colors, typography } from '@/theme/designTokens';
import { systemService } from '@/services/api/systemService';
import { router, useFocusEffect } from 'expo-router';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ErrorState, LoadingSkeleton } from '@/components/design-system/FeedbackStates';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { WorkoutOverviewPresentation } from '@/features/workout';
import { WorkoutPlanViewModel } from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';
import type { MonthlyWorkoutStats, WorkoutGoals } from '@/repositories/workoutRepository';

export default function WorkoutScreen() {
  const [plans, setPlans] = useState<WorkoutPlanViewModel[]>([]);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MonthlyWorkoutStats | null>(null);
  const [goals, setGoals] = useState<WorkoutGoals | null>(null);
  const [currentWeightKg, setCurrentWeightKg] = useState<number | null>(null);
  const [completedTodayPlanIds, setCompletedTodayPlanIds] = useState<string[]>([]);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const repository = getWorkoutRepository();
      const nextPlans = await repository.listPlans();
      setPlans(nextPlans);
      const [history, workoutGoals, weight] = await Promise.allSettled([
        repository.getHistory(),
        repository.getWorkoutGoals(),
        repository.getWeightRecords(),
      ]);
      setStats(history.status === 'fulfilled' ? history.value.stats : null);
      setCompletedTodayPlanIds(history.status === 'fulfilled'
        ? history.value.sessions.filter((session) =>
            session.status === 'completed' &&
            new Date(session.completedAt).toDateString() === new Date().toDateString()
          ).map((session) => session.planId)
        : []);
      setGoals(workoutGoals.status === 'fulfilled' ? workoutGoals.value : null);
      setCurrentWeightKg(
        weight.status === 'fulfilled' && weight.value.currentWeightKg > 0
          ? weight.value.currentWeightKg
          : null
      );
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải kế hoạch tập luyện.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadPlans();
    void systemService.getCapabilities().then(value => { if (active) setAiAvailable(value.ai.enabled && value.ai.workout_adjust); });
    return () => { active = false; };
  }, [loadPlans]));

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Kế hoạch tập luyện" hideDivider />
      {aiAvailable && <TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }} onPress={() => router.push('/workout/ai-suggestions' as never)}><Text style={{ ...typography.body, color: colors.primary }}>Gợi ý tập luyện AI</Text></TouchableOpacity>}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState title="Không thể tải kế hoạch" description={error} onAction={() => void loadPlans()} />
      ) : (
        <WorkoutOverviewPresentation
          plans={plans}
          completedTodayPlanIds={completedTodayPlanIds}
          onSelectPlan={(id) => router.push(`/workout/${id}` as any)}
          onCreatePlan={(day) => router.push(`/workout/editor${day ? `?day=${day}` : ''}` as any)}
          onOpenHistory={() => router.push('/workout/history' as any)}
          onOpenGoals={() => router.push('/workout/goals' as any)}
          onOpenWeight={() => router.push('/workout/weight' as any)}
          monthlyCompleted={stats?.completedCount ?? null}
          monthlyTarget={goals?.monthlyWorkoutTarget ?? null}
          currentWeightKg={currentWeightKg}
          targetWeightKg={goals?.targetWeightKg ?? null}
        />
      )}
    </ScreenContainer>
  );
}
