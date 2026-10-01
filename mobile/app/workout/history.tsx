import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WorkoutHistoryPresentation } from '../../src/features/workout/WorkoutHistoryPresentation';
import { WorkoutHistoryItemViewModel } from '../../src/features/workout/workoutTypes';
import { getWorkoutRepository, MonthlyWorkoutStats } from '@/repositories/workoutRepository';

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutHistoryItemViewModel[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyWorkoutStats>({
    monthYear: 'Tháng này',
    completedCount: 0,
    targetCount: 0,
    totalVolumeKg: 0,
    caloriesBurned: 0,
    averageDurationMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWorkoutRepository()
      .getHistory()
      .then((data) => {
        setSessions(data.sessions);
        setMonthlyStats(data.stats);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải lịch sử tập luyện');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WorkoutHistoryPresentation
        sessions={sessions}
        monthlyStats={monthlyStats}
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
