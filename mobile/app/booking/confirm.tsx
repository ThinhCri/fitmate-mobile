import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ConfirmHoldPresentation } from '../../src/features/booking/ConfirmHoldPresentation';
import { BookingHoldQuoteViewModel } from '../../src/features/booking/bookingTypes';
import { bookingService } from '@/services/api/bookingService';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    holdId?: string;
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
  const [remainingSeconds, setRemainingSeconds] = useState(300);

  const priceVnd = parseInt(params.priceVnd || '300000', 10);
  const holdId = params.holdId || 'bk-hold-8921';

  const quote: BookingHoldQuoteViewModel = {
    bookingId: holdId,
    coach: {
      id: params.coachId || 'coach-1',
      name: params.coachName || 'HLV Hoàng Nam',
      title: 'Pro PT',
      specialty: 'Thể hình & Phục hồi',
      rating: 4.95,
      reviewCount: 48,
      isVerified: true,
    },
    service: {
      id: params.serviceId || 'srv-1',
      name: params.serviceName || 'Tập sức mạnh cá nhân 1-kèm-1',
      durationMinutes: 60,
      priceVnd,
      description: 'Tập trung kỹ thuật chuẩn y sinh học, an toàn và tối ưu.',
      locationName: 'Fitmate Partner Studio',
      locationAddress: 'Thành phố Hồ Chí Minh',
    },
    selectedDate: params.selectedDate || 'Hôm nay',
    selectedTimeSlot: params.selectedTimeSlot || '18:00 - 19:00',
    location: 'Fitmate Partner Studio (TP. Hồ Chí Minh)',
    servicePriceVnd: priceVnd,
    platformFeeVnd: 0,
    totalVnd: priceVnd,
    holdExpiresAt: params.expiresAt || new Date(Date.now() + 300000).toISOString(),
    remainingSeconds,
  };

  useEffect(() => {
    if (!params.expiresAt) return;
    const updateCountdown = () => {
      const diffSec = Math.max(
        0,
        Math.floor((new Date(params.expiresAt!).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(diffSec);
      if (diffSec <= 0) {
        Alert.alert(
          'Hết hạn giữ chỗ',
          'Thời gian giữ chỗ tạm thời (5 phút) đã kết thúc. Vui lòng chọn lại khung giờ.',
          [{ text: 'Đồng ý', onPress: () => router.back() }]
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [params.expiresAt, router]);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      if (params.holdId) {
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

  return (
    <View style={styles.container}>
      <ConfirmHoldPresentation
        quote={quote}
        isProcessing={isProcessing}
        onPayPayOS={handlePay}
        onCancelHold={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
