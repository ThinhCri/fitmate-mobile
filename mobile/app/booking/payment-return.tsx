import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PaymentReturnMatrixPresentation,
  PaymentReturnStatus,
} from '@/features/booking/PaymentReturnMatrixPresentation';
import { NativePaymentModal } from '@/features/booking/NativePaymentModal';
import { bookingService } from '@/services/api/bookingService';
import type { PaymentWire } from '@/services/api/types';
import { colors } from '@/theme/designTokens';

export default function PaymentReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    paymentId?: string;
    bookingCode?: string;
    cancel?: string;
  }>();

  const [payment, setPayment] = useState<PaymentWire | null>(null);
  const [appointmentDetail, setAppointmentDetail] = useState<any | null>(null);
  const [showNativeModal, setShowNativeModal] = useState(false);
  const [status, setStatus] = useState<PaymentReturnStatus>(
    params.cancel === 'true' ? 'canceled' : 'verifying'
  );
  const [error, setError] = useState<string>();

  const check = useCallback(async () => {
    if (params.cancel === 'true') {
      setStatus('canceled');
      return;
    }
    if (!params.paymentId) {
      setStatus('failed');
      setError('Thiếu mã giao dịch thanh toán.');
      return;
    }
    setStatus('verifying');
    setError(undefined);
    try {
      const result = await bookingService.getMyPayment(params.paymentId);
      setPayment(result);
      if (result.status === 'Paid') {
        setStatus('success');
        if (result.appointment_id) {
          bookingService.getMyBookingDetail(result.appointment_id).then(setAppointmentDetail).catch(() => {});
        }
      } else if (result.status === 'Failed') {
        setStatus('failed');
      } else if (result.status === 'Refunded' || result.status === 'PartialRefunded') {
        setStatus('canceled');
      } else if (result.status === 'Pending') {
        setStatus('pending');
      } else {
        setStatus('uncertain');
      }
    } catch (e) {
      setStatus('uncertain');
      setError(e instanceof Error ? e.message : 'Không thể kiểm tra trạng thái giao dịch.');
    }
  }, [params.cancel, params.paymentId]);

  useEffect(() => {
    void check();
  }, [check]);

  const appointmentId = payment?.appointment_id;

  const handleContinuePayment = () => {
    if (payment) {
      setShowNativeModal(true);
    } else {
      Alert.alert('Không thể mở liên kết', 'Liên kết thanh toán không còn khả dụng hoặc đã hết hạn.');
    }
  };

  const handleCancelHold = () => {
    if (!appointmentId) {
      router.replace('/(tabs)/marketplace' as never);
      return;
    }
    Alert.alert(
      'Hủy giữ chỗ',
      'Bạn có chắc chắn muốn hủy giữ chỗ và giải phóng khung giờ này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy giữ chỗ',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelMyBooking(appointmentId, 'Hủy đơn chưa thanh toán');
              Alert.alert('Đã hủy', 'Đơn giữ chỗ đã được hủy thành công.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/marketplace' as never) },
              ]);
            } catch (err) {
              Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể hủy giữ chỗ.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <PaymentReturnMatrixPresentation
        status={status}
        bookingCode={params.bookingCode || appointmentId || '—'}
        amountVnd={payment?.amount_vnd ?? 0}
        scheduledTime={
          appointmentDetail?.slot_start_utc
            ? `${new Date(appointmentDetail.slot_start_utc).toLocaleDateString('vi-VN')} lúc ${new Date(
                appointmentDetail.slot_start_utc
              ).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
            : undefined
        }
        errorMessage={error}
        redirectUrl={payment?.redirect_url}
        onViewAppointment={() =>
          appointmentId
            ? router.replace(`/booking/${appointmentId}` as never)
            : router.replace('/booking' as never)
        }
        onBackToPt={() => {
          if (appointmentDetail?.pt_user_id) {
            router.replace(`/trainer/${appointmentDetail.pt_user_id}?justBooked=true` as never);
          } else {
            router.replace('/(tabs)/marketplace' as never);
          }
        }}
        onRetryOrChooseAgain={() => router.replace('/(tabs)/marketplace' as never)}
        onContactSupport={() =>
          router.push({
            pathname: '/support/create' as never,
            params: appointmentId ? { bookingId: appointmentId } : {},
          })
        }
        onRecheckStatus={() => void check()}
        onContinuePayment={handleContinuePayment}
        onCancelHold={handleCancelHold}
      />
      <NativePaymentModal
        visible={showNativeModal}
        payment={payment}
        onClose={() => setShowNativeModal(false)}
        onPaymentSuccess={() => {
          setShowNativeModal(false);
          void check();
        }}
        onCancelHold={() => {
          setShowNativeModal(false);
          handleCancelHold();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
