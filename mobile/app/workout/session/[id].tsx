import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SessionDetailPresentation } from '../../../src/features/workout/SessionDetailPresentation';
import { WorkoutSessionSummaryViewModel } from '../../../src/features/workout/workoutTypes';

const MOCK_SESSION_DETAIL: WorkoutSessionSummaryViewModel = {
  id: 'ses-20260928-098',
  planId: 'plan-1',
  planTitle: 'Upper Body A — Thể lực & Sức mạnh',
  startedAt: 'Thứ Hai, 28/09/2026 • 18:00 - 18:42:15',
  endedAt: '18:42:15',
  durationSeconds: 2535,
  caloriesBurned: 295,
  totalExercises: 2,
  completedExercises: 2,
  totalSets: 7,
  completedSets: 6,
  syncStatus: 'pending',
  records: [
    {
      exerciseId: 'ex-1',
      exerciseName: 'Đẩy ngực tạ đòn (Barbell Bench Press)',
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

export default function SessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <SessionDetailPresentation
        session={{
          ...MOCK_SESSION_DETAIL,
          id: id || MOCK_SESSION_DETAIL.id,
        }}
        totalVolumeKg={3450}
        onBack={() => router.back()}
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
