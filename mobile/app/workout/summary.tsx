import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WorkoutSummaryPresentation } from '../../src/features/workout/WorkoutSummaryPresentation';
import { WorkoutSessionSummaryViewModel } from '../../src/features/workout/workoutTypes';

const MOCK_SUMMARY: WorkoutSessionSummaryViewModel = {
  id: 'ses-20260928-01',
  planId: 'plan-1',
  planTitle: 'Upper Body A — Thể lực & Sức mạnh',
  startedAt: '18:00',
  endedAt: '18:42',
  durationSeconds: 2535, // 42m 15s
  caloriesBurned: 295,
  totalExercises: 2,
  completedExercises: 2,
  totalSets: 7,
  completedSets: 6,
  syncStatus: 'pending',
  records: [
    {
      exerciseId: 'ex-1',
      exerciseName: 'Đẩy ngực tạ đòn (Bench Press)',
      sets: [
        { setNumber: 1, repsCompleted: 10, status: 'completed' },
        { setNumber: 2, repsCompleted: 10, status: 'completed' },
        { setNumber: 3, repsCompleted: 10, status: 'completed' },
        { setNumber: 4, repsCompleted: 8, status: 'completed' },
      ],
    },
    {
      exerciseId: 'ex-2',
      exerciseName: 'Đẩy tạ đơn dốc lên (Incline DB Press)',
      sets: [
        { setNumber: 1, repsCompleted: 12, status: 'completed' },
        { setNumber: 2, repsCompleted: 10, status: 'completed' },
        { setNumber: 3, status: 'skipped' },
      ],
    },
  ],
};

export default function WorkoutSummaryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <WorkoutSummaryPresentation
        summary={MOCK_SUMMARY}
        onDone={() => router.replace('/(tabs)/workout' as any)}
        onViewDetails={() => router.push(`/workout/session/${MOCK_SUMMARY.id}` as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
