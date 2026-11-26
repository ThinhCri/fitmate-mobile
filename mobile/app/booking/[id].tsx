import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppointmentDetailPresentation } from '../../src/features/booking/AppointmentDetailPresentation';
import { BookingAppointmentViewModel } from '../../src/features/booking/bookingTypes';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors, spacing, typography } from '@/theme/designTokens';
import { bookingService } from '@/services/api/bookingService';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<BookingAppointmentViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const repo = getBookingRepository();
      const data = await repo.getAppointmentDetail(id);
      setAppointment(data);
      setMeetingUrl(null);
      if (['confirmed', 'in_progress', 'completed', 'awaiting_member_confirmation'].includes(data.bookingStatus)) {
        try {
          setMeetingUrl(await bookingService.getMeetingLink(id));
        } catch {
          // In-person sessions have no Meet room; booking detail remains usable.
        }
      }
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
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, styles.loadingText]}>
          Đang tải thông tin lịch hẹn...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !appointment) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, styles.center]}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppointmentDetailPresentation
        appointment={appointment}
        meetingUrl={meetingUrl}
        onJoinMeeting={() => {
          if (meetingUrl) void Linking.openURL(meetingUrl).catch(() =>
            Alert.alert('Không mở được Google Meet', 'Vui lòng kiểm tra ứng dụng hoặc trình duyệt trên thiết bị.'));
        }}
        onCancelBooking={() => router.push(`/booking/cancel-refund?id=${appointment.id}` as any)}
        onReschedule={() => router.push(`/booking/select-slot?coachId=${appointment.coach.id}&rescheduleBookingId=${appointment.id}` as any)}
        onReviewPt={() => router.push(`/booking/review?bookingId=${appointment.id}&ptId=${appointment.coach.id}&coachName=${encodeURIComponent(appointment.coach.name)}` as any)}
        onMessageCoach={() => router.push(`/chat/${appointment.coach.id}` as any)}
        onContactSupport={() => router.push(`/support/create?bookingId=${appointment.id}` as any)}
        onConfirmCompletion={() => {
          Alert.alert('Xác nhận hoàn thành', 'Bạn xác nhận buổi tập đã diễn ra và hoàn thành?', [
            { text: 'Để sau', style: 'cancel' },
            {
              text: 'Xác nhận',
              onPress: async () => {
                try {
                  const updated = await getBookingRepository().confirmCompletion(appointment.id);
                  setAppointment(updated);
                  Alert.alert(
                    'Đã xác nhận hoàn thành!',
                    'Cảm ơn bạn đã xác nhận buổi tập. Bạn có muốn đánh giá sao và nhận xét cho HLV ngay bây giờ không?',
                    [
                      { text: 'Để sau', style: 'cancel' },
                      {
                        text: 'Đánh giá ngay',
                        onPress: () =>
                          router.push(
                            `/booking/review?bookingId=${updated.id}&ptId=${updated.coach.id}&coachName=${encodeURIComponent(updated.coach.name)}` as any
                          ),
                      },
                    ]
                  );
                } catch (err) {
                  Alert.alert('Không thể xác nhận', err instanceof Error ? err.message : 'Vui lòng thử lại.');
                }
              },
            },
          ]);
        }}
        onDisputeCompletion={() => {
          Alert.alert('Báo cáo vấn đề', 'Booking sẽ tạm dừng hoàn tất và chuyển cho bộ phận hỗ trợ xử lý.', [
            { text: 'Đóng', style: 'cancel' },
            {
              text: 'Tiếp tục báo cáo',
              style: 'destructive',
              onPress: async () => {
                try {
                  const updated = await getBookingRepository().disputeCompletion(
                    appointment.id,
                    'Hội viên báo cáo vấn đề sau khi PT gửi xác nhận hoàn thành.'
                  );
                  setAppointment(updated);
                  router.push(`/support/create?bookingId=${appointment.id}` as any);
                } catch (err) {
                  Alert.alert('Không thể gửi báo cáo', err instanceof Error ? err.message : 'Vui lòng thử lại.');
                }
              },
            },
          ]);
        }}
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
