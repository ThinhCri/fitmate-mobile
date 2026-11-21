import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SessionDetailPresentation } from '../../../src/features/workout/SessionDetailPresentation';
import { WorkoutSessionSummaryViewModel } from '../../../src/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';
import { colors } from '@/theme/designTokens';

export default function SessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<WorkoutSessionSummaryViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const goBack = () => router.canGoBack() ? router.back() : router.dismissTo('/(tabs)/workout');

  useEffect(() => {
    if (!id) return;
    getWorkoutRepository()
      .getSessionDetail(id)
      .then((data) => {
        setSession(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải chi tiết buổi tập');
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

  if (error || !session) {
    return (
      <View style={[styles.container, styles.center]}>
        <TouchableOpacity onPress={goBack} accessibilityRole="button" accessibilityLabel="Quay lại"><Text style={styles.backText}>← Quay lại</Text></TouchableOpacity>
        <Text style={styles.errorText}>{error || 'Không tìm thấy buổi tập'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SessionDetailPresentation
        session={session}
        onBack={goBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600', padding: 16 },
});
