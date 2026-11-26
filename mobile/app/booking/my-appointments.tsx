import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { MyAppointmentsPresentation } from '../../src/features/booking/MyAppointmentsPresentation';
import { BookingAppointmentViewModel } from '../../src/features/booking/bookingTypes';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function MyAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<BookingAppointmentViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repo = getBookingRepository();
      const list = await repo.listMyAppointments();
      setAppointments(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải danh sách lịch hẹn.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchAppointments();
    }, [fetchAppointments])
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, styles.loadingText]}>
          Đang tải lịch hẹn...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, styles.center]}>
        <Text style={[typography.body, styles.errorText]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAppointments}
          accessibilityRole="button"
        >
          <Text style={[typography.bodyBold, styles.retryText]}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <MyAppointmentsPresentation
        appointments={appointments}
        onSelectAppointment={(id) => router.push(`/booking/${id}` as any)}
        onExploreTrainers={() => router.push('/(tabs)/marketplace' as any)}
        onOpenPackages={() => router.push('/booking/packages' as never)}
      />
    </SafeAreaView>
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
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
  },
});
