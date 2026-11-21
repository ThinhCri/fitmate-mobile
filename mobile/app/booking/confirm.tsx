import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Linking, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ConfirmHoldPresentation } from '../../src/features/booking/ConfirmHoldPresentation';
import { BookingHoldQuoteViewModel } from '../../src/features/booking/bookingTypes';
import { bookingService } from '@/services/api/bookingService';
import type { AppointmentWire } from '@/services/api/types';
import { colors, spacing } from '@/theme/designTokens';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    holdId?: string;
    appointmentId?: string;
    coachId?: string;
    coachName?: string;
    serviceId?: string;
    serviceName?: string;
    priceVnd?: string;
    selectedDate?: string;
    selectedTimeSlot?: string;
    expiresAt?: string;
  }>();

  const [isProcessing, setIsProcessing] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentWire | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const expiryShown = useRef(false);

  useEffect(() => {
    if (!params.holdId || !params.appointmentId || !params.coachName || !params.serviceName) {
      setError('Thiếu thông tin giữ chỗ. Vui lòng chọn lại lịch tập.');
      setLoading(false);
      return;
    }
    let active = true;
    Promise.all([bookingService.getBookingHold(params.holdId), bookingService.getMyBookingDetail(params.appointmentId)])
      .then(([hold, detail]) => {
        if (!active) return;
        if (!hold.is_active || detail.id !== params.appointmentId) throw new Error('Giờ giữ chỗ đã hết hạn. Vui lòng chọn lại.');
        setAppointment(detail);
        setExpiresAt(hold.expires_at);
        setError('');
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Không thể kiểm tra giờ giữ chỗ.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.appointmentId, params.coachName, params.holdId, params.serviceName]);

  const totalVnd = appointment ? Math.max(0, appointment.price_listed_vnd - appointment.discount_vnd) : 0;
  const quote: BookingHoldQuoteViewModel | null = appointment && params.holdId ? {
    bookingId: params.holdId,
    slotStartUtc: appointment.slot_start_utc,
    coach: { id: appointment.pt_user_id, name: params.coachName!, title: 'Huấn luyện viên', specialty: '', rating: 0, reviewCount: 0, isVerified: true },
    service: { id: appointment.service_id, name: params.serviceName!, durationMinutes: appointment.duration_minutes, priceVnd: totalVnd, description: '', locationName: '', locationAddress: '' },
    selectedDate: new Date(appointment.slot_start_utc).toLocaleDateString('vi-VN'),
    selectedTimeSlot: new Date(appointment.slot_start_utc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    location: '',
    servicePriceVnd: totalVnd,
    platformFeeVnd: 0,
    totalVnd,
    holdExpiresAt: expiresAt,
    remainingSeconds,
  } : null;

  useEffect(() => {
    if (!expiresAt) return;
    const updateCountdown = () => {
      const diffSec = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(diffSec);
      if (diffSec <= 0 && !expiryShown.current) {
        expiryShown.current = true;
        Alert.alert(
          'Hết hạn giữ chỗ',
          'Thời gian giữ chỗ đã kết thúc. Vui lòng chọn lại khung giờ.',
          [{ text: 'Đồng ý', onPress: () => router.back() }]
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, router]);

  const createPayment = async () => {
    if (!quote || remainingSeconds <= 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      if (params.holdId) {
        const hold = await bookingService.getBookingHold(params.holdId);
        if (!hold.is_active) throw new Error('Giờ giữ chỗ đã hết hạn. Vui lòng chọn lại.');
        const payment = await bookingService.createPayment({
          hold_id: params.holdId,
          method: 'payos',
        });
        router.replace({
          pathname: '/booking/payment-return' as any,
          params: { paymentId: payment.id, bookingCode: `BK-${payment.appointment_id.slice(0, 8).toUpperCase()}` },
        });
        if (payment.redirect_url) await Linking.openURL(payment.redirect_url);
        return;
      }
      throw new Error('Thiếu mã giữ chỗ để tạo thanh toán.');
    } catch (err) {
      Alert.alert(
        'Thanh toán chưa hoàn tất',
        err instanceof Error ? err.message : 'Không thể khởi tạo thanh toán. Vui lòng thử lại.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = () => {
    if (!quote || remainingSeconds <= 0 || isProcessing) return;
    const timeUntilStart = new Date(quote.slotStartUtc || '').getTime() - Date.now();
    if (Number.isFinite(timeUntilStart) && timeUntilStart < 48 * 60 * 60 * 1000) {
      Alert.alert(
        'Buổi tập trong vòng 48 giờ',
        'Bạn sẽ không thể tự hủy hoặc đổi lịch để được hoàn tiền nếu bận hoặc vắng mặt. Chỉ thanh toán khi chắc chắn tham gia được.',
        [
          { text: 'Chọn giờ khác', style: 'cancel' },
          { text: 'Tôi hiểu, tiếp tục', onPress: () => void createPayment() },
        ],
      );
      return;
    }
    void createPayment();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {loading ? <ActivityIndicator style={styles.center} color={colors.primary} /> : error || !quote ? <View style={styles.center}><Text style={styles.message}>{error || 'Không thể tải thông tin giữ chỗ.'}</Text><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Chọn lại giờ</Text></TouchableOpacity></View> : <ConfirmHoldPresentation
        quote={quote}
        isProcessing={isProcessing || remainingSeconds <= 0}
        onPayPayOS={handlePay}
        onCancelHold={() => {
          Alert.alert(
            'Hủy giữ chỗ',
            'Bạn có chắc chắn muốn hủy giữ chỗ và giải phóng khung giờ này không?',
            [
              { text: 'Không', style: 'cancel' },
              {
                text: 'Hủy giữ chỗ',
                style: 'destructive',
                onPress: async () => {
                  if (params.appointmentId) {
                    try {
                      await bookingService.cancelMyBooking(params.appointmentId, 'Hủy giữ chỗ để chọn khung giờ khác');
                    } catch {}
                  }
                  router.back();
                },
              },
            ]
          );
        }}
      />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  message: { color: colors.textPrimary, textAlign: 'center' },
  back: { color: colors.primary, fontWeight: '700', padding: spacing.md },
});
