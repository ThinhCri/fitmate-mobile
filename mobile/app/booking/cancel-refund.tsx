import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CancelRefundTrackingPresentation } from '../../src/features/booking/CancelRefundTrackingPresentation';
import { BookingAppointmentViewModel, RefundTrackingViewModel } from '../../src/features/booking/bookingTypes';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function CancelRefundScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<BookingAppointmentViewModel | null>(null);
  const [refundData, setRefundData] = useState<RefundTrackingViewModel | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointment = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const repo = getBookingRepository();
      const data = await repo.getAppointmentDetail(id);
      setAppointment(data);
      if (data.bookingStatus === 'cancelled') {
        const tracking = await repo.getRefundTracking(id);
        setRefundData(tracking);
      }
    } catch {
      // Fallback if not found or offline
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const handleConfirmCancel = async (reason: string) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const repo = getBookingRepository();
      await repo.cancelAppointment(id, reason);
      const tracking = await repo.getRefundTracking(id);
      setRefundData(tracking);
      Alert.alert(
        'Đã hủy lịch tập',
        'Yêu cầu hủy lịch đã được xác nhận bởi hệ thống. Bạn có thể theo dõi tiến trình hoàn tiền ngay bên dưới.'
      );
    } catch (err) {
      Alert.alert(
        'Hủy lịch thất bại',
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi hủy lịch.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, styles.loadingText]}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CancelRefundTrackingPresentation
        refundData={refundData}
        bookingCode={appointment?.bookingCode || `BK-${(id || '1').slice(0, 8).toUpperCase()}`}
        paidAmountVnd={appointment?.paidAmountVnd || 0}
        eligibleRefundAmountVnd={appointment?.paidAmountVnd || 0}
        onConfirmCancel={handleConfirmCancel}
        onContactSupport={() => router.push(`/support/create?bookingId=${id || ''}` as any)}
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
});
