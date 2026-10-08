import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WorkoutSummaryPresentation } from '@/features/workout/WorkoutSummaryPresentation';
import { WorkoutSessionSummaryViewModel } from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';

export default function WorkoutSummaryScreen() {
  const router = useRouter(); const { sessionId } = useLocalSearchParams<{ sessionId?: string }>(); const [summary, setSummary] = useState<WorkoutSessionSummaryViewModel | null>(null); const [error, setError] = useState('');
  useEffect(() => { if (!sessionId) { setError('Thiếu mã buổi tập.'); return; } getWorkoutRepository().getSessionDetail(sessionId).then(setSummary).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải kết quả buổi tập.')); }, [sessionId]);
  if (!summary) return <View style={[styles.container, styles.center]}>{error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator />}</View>;
  return <View style={styles.container}><WorkoutSummaryPresentation summary={summary} onDone={() => router.dismissTo('/(tabs)/workout')} onViewDetails={() => router.push(`/workout/session/${summary.id}` as never)} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' }, center: { justifyContent: 'center', alignItems: 'center', padding: 24 }, error: { color: '#DC2626', textAlign: 'center' } });
