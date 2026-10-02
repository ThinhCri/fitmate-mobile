import React, { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ErrorState, LoadingSkeleton } from '@/components/design-system/FeedbackStates';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { WorkoutOverviewPresentation } from '@/features/workout';
import { WorkoutPlanViewModel } from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';

export default function WorkoutScreen() {
  const [plans, setPlans] = useState<WorkoutPlanViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await getWorkoutRepository().listPlans());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải kế hoạch tập luyện.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPlans(); }, [loadPlans]);

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Kế hoạch tập luyện" hideDivider />
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState title="Không thể tải kế hoạch" description={error} onAction={() => void loadPlans()} />
      ) : (
        <WorkoutOverviewPresentation
          plans={plans}
          onSelectPlan={(id) => router.push(`/workout/${id}` as any)}
          onCreatePlan={() => router.push('/workout/editor' as any)}
          onOpenHistory={() => router.push('/workout/history' as any)}
        />
      )}
    </ScreenContainer>
  );
}
