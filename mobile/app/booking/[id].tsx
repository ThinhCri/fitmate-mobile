import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppointmentDetailPresentation } from '../../src/features/booking/AppointmentDetailPresentation';
import { BookingAppointmentViewModel } from '../../src/features/booking/bookingTypes';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<BookingAppointmentViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const repo = getBookingRepository();
      const data = await repo.getAppointmentDetail(id);
      setAppointment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải chi tiết lịch hẹn.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, styles.loadingText]}>
          Đang tải thông tin lịch hẹn...
        </Text>
      </View>
    );
  }

  if (error || !appointment) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[typography.body, styles.errorText]}>
          {error || 'Không tìm thấy lịch hẹn.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAppointment}
          accessibilityRole="button"
        >
          <Text style={[typography.bodyBold, styles.retryText]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppointmentDetailPresentation
        appointment={appointment}
        onCancelBooking={() => router.push(`/booking/cancel-refund?id=${appointment.id}` as any)}
        onReschedule={() => router.push(`/booking/select-slot?coachId=${appointment.coach.id}&rescheduleBookingId=${appointment.id}` as any)}
        onReviewPt={() => router.push(`/booking/review?bookingId=${appointment.id}&ptId=${appointment.coach.id}&coachName=${encodeURIComponent(appointment.coach.name)}` as any)}
        onMessageCoach={() => router.push(`/chat/${appointment.coach.id}` as any)}
        onContactSupport={() => router.push(`/support/create?bookingId=${appointment.id}` as any)}
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
