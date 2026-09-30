import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WorkoutHistoryPresentation } from '../../src/features/workout/WorkoutHistoryPresentation';
import { WorkoutHistoryItemViewModel } from '../../src/features/workout/workoutTypes';

const MOCK_SESSIONS: WorkoutHistoryItemViewModel[] = [
  {
    id: 'ses-1',
    planId: 'plan-1',
    planTitle: 'Upper Body A — Thể lực & Sức mạnh',
    category: 'Thân trên',
    completedAt: 'Hôm nay, 18:45',
    durationSeconds: 2535,
    totalVolumeKg: 3450,
    caloriesBurned: 295,
    completedSets: 6,
    totalSets: 7,
    syncStatus: 'pending',
  },
  {
    id: 'ses-2',
    planId: 'plan-2',
    planTitle: 'Lower Body & Core B',
    category: 'Thân dưới',
    completedAt: 'Thứ Năm, 26/09/2026',
    durationSeconds: 2700,
    totalVolumeKg: 4200,
    caloriesBurned: 350,
    completedSets: 8,
    totalSets: 8,
    syncStatus: 'synced',
  },
  {
    id: 'ses-3',
    planId: 'plan-3',
    planTitle: 'Cardio HIIT & Bụng',
    category: 'Cardio',
    completedAt: 'Thứ Ba, 24/09/2026',
    durationSeconds: 1800,
    totalVolumeKg: 0,
    caloriesBurned: 280,
    completedSets: 5,
    totalSets: 5,
    syncStatus: 'synced',
  },
];

const MOCK_MONTHLY_STATS = {
  monthYear: 'Tháng 9/2026',
  completedCount: 24,
  targetCount: 25,
  totalVolumeKg: 38450,
  caloriesBurned: 7200,
  averageDurationMinutes: 45,
};

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const [sessions] = useState<WorkoutHistoryItemViewModel[]>(MOCK_SESSIONS);

  return (
    <View style={styles.container}>
      <WorkoutHistoryPresentation
        sessions={sessions}
        monthlyStats={MOCK_MONTHLY_STATS}
        onSelectSession={(id) => router.push(`/workout/session/${id}` as any)}
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
