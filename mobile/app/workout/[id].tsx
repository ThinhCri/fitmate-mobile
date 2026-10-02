import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlanDetailPresentation } from '../../src/features/workout/PlanDetailPresentation';
import { WorkoutPlanViewModel } from '../../src/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkoutPlanViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getWorkoutRepository()
      .getPlan(id)
      .then((data) => {
        setPlan(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải giáo án');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy giáo án'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlanDetailPresentation
        plan={plan}
        onBack={() => router.back()}
        onStartSession={() => router.push(`/workout/active-session?planId=${encodeURIComponent(plan.id)}` as any)}
        onEditPlan={() => router.push('/workout/editor' as any)}
        onDeletePlan={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
  },
});
