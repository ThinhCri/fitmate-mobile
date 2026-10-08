import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { WorkoutHistoryPresentation } from '../../src/features/workout/WorkoutHistoryPresentation';
import { WorkoutHistoryItemViewModel } from '../../src/features/workout/workoutTypes';
import { getWorkoutRepository, MonthlyWorkoutStats } from '@/repositories/workoutRepository';
import { colors, spacing } from '@/theme/designTokens';

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
  const [monthOffset, setMonthOffset] = useState(0);
  const goBack = () => router.dismissTo('/(tabs)/workout');
  const selectedMonth = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
  const monthSessions = sessions.filter((session) => {
    const date = new Date(session.completedAt);
    return !Number.isNaN(date.getTime()) && date.getFullYear() === selectedMonth.getFullYear() && date.getMonth() === selectedMonth.getMonth();
  });
  const completed = monthSessions.filter((session) => session.status === 'completed');
  const displayedStats: MonthlyWorkoutStats = {
    ...monthlyStats,
    monthYear: selectedMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    completedCount: completed.length,
    targetCount: monthOffset === 0 ? monthlyStats.targetCount : 0,
    caloriesBurned: completed.reduce((sum, session) => sum + session.caloriesBurned, 0),
    averageDurationMinutes: completed.length ? Math.round(completed.reduce((sum, session) => sum + session.durationSeconds, 0) / completed.length / 60) : 0,
  };

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

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Quay lại lịch tập">
        <ArrowLeft size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Lịch sử tập luyện</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}
      <WorkoutHistoryPresentation
        sessions={monthSessions}
        monthlyStats={displayedStats}
        onFilterMonth={() => setMonthOffset((current) => current - 1)}
        onNextMonth={monthOffset < 0 ? () => setMonthOffset((current) => current + 1) : undefined}
        onSelectSession={(id) => router.push(`/workout/session/${id}` as any)}
        onConfigureGoals={() => router.push('/workout/goals' as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: { height: 56, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  headerSpacer: { width: 48 },
  center: {
    flex: 1,
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
