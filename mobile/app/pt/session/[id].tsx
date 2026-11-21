import { colors } from '@/theme/designTokens';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { PtSessionManagementPresentation } from '@/features/pt/PtSessionManagementPresentation';
import { bookingService } from '@/services/api/bookingService';
import { authService } from '@/services/api/authService';
import { ptService } from '@/services/api/ptService';
import type { AppointmentWire } from '@/services/api/types';

export default function PtSessionManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<AppointmentWire | null>(null);
  const [serviceName, setServiceName] = useState('Buổi huấn luyện');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) { setError('Thiếu mã lịch hẹn.'); return; }
    try {
      setError('');
      const [me, detail] = await Promise.all([authService.getMe(), bookingService.getMyBookingDetail(id)]);
      if (detail.pt_user_id !== me.id) throw new Error('Lịch hẹn này không thuộc tài khoản PT của bạn.');
      setBooking(detail);
      try {
        const services = await ptService.getMyServices();
        setServiceName(services.find((service) => service.id === detail.service_id)?.name || 'Buổi huấn luyện');
      } catch {
        setServiceName('Buổi huấn luyện');
      }
    } catch (cause) {
      setBooking(null);
      setError(cause instanceof Error ? cause.message : 'Không thể tải lịch hẹn.');
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const mutate = async (action: () => Promise<AppointmentWire>, success: string) => {
    if (busy) return;
    setBusy(true);
    try {
      setBooking(await action());
      Alert.alert('Đã cập nhật', success);
    } catch (cause) {
      Alert.alert('Không thể cập nhật lịch hẹn', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
      void load();
    } finally {
      setBusy(false);
    }
  };

  if (!booking) return <View style={styles.center}>{error ? <Text style={styles.error} onPress={() => void load()}>{error}{'\n'}Chạm để thử lại</Text> : <ActivityIndicator />}</View>;

  const status = booking.status === 'Pending' ? 'pending'
    : booking.status === 'Confirmed' ? 'confirmed'
    : booking.status === 'InProgress' ? 'in_progress'
    : booking.status === 'Completed' ? 'completed'
    : booking.status === 'Cancelled' ? 'cancelled'
    : booking.status === 'AwaitingMemberConfirmation' ? 'awaiting_member_confirmation'
    : booking.status === 'Disputed' ? 'disputed'
    : booking.status === 'Held' ? 'held'
    : 'other';

  return (
    <View style={styles.container}>
      <PtSessionManagementPresentation
        sessionId={booking.id}
        bookingCode={booking.id.slice(0, 8).toUpperCase()}
        clientName={`Hội viên ${booking.member_id.slice(0, 8)}`}
        serviceName={serviceName}
        scheduledTime={new Date(booking.slot_start_utc).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
        location=""
        status={status}
        paidAmountVnd={booking.actual_paid_vnd}
        busy={busy}
        onAcceptSession={status === 'pending' ? () => void mutate(() => bookingService.confirmMyBooking(booking.id), 'Lịch hẹn đã được xác nhận.') : undefined}
        onStartSession={status === 'confirmed' ? () => void mutate(() => bookingService.startMyBooking(booking.id), 'Buổi tập đã bắt đầu.') : undefined}
        onCompleteSession={status === 'in_progress' ? () => void mutate(() => bookingService.completeMyBooking(booking.id), 'Đã gửi kết quả buổi tập. Đang chờ hội viên xác nhận hoặc phản hồi.') : undefined}
        onCancelSession={status === 'pending' || status === 'confirmed' ? (reason) => Alert.alert('Xác nhận hủy lịch dạy', 'Lịch hẹn sẽ được hủy và xử lý hoàn tiền theo chính sách. Bạn chắc chắn muốn tiếp tục?', [
          { text: 'Giữ lịch', style: 'cancel' },
          { text: 'Hủy lịch', style: 'destructive', onPress: () => void mutate(() => bookingService.cancelMyBooking(booking.id, reason), 'Lịch hẹn đã hủy.') },
        ]) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#DC2626', textAlign: 'center' },
});
