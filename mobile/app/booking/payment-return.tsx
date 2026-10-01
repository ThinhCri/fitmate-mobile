import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  PaymentReturnMatrixPresentation,
  PaymentReturnStatus,
} from '../../src/features/booking/PaymentReturnMatrixPresentation';

export default function PaymentReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; cancel?: string; bookingCode?: string }>();
  const [status, setStatus] = useState<PaymentReturnStatus>('verifying');

  useEffect(() => {
    // If query parameters indicate cancellation
    if (params.cancel === 'true') {
      setStatus('canceled');
      return;
    }

    // In production and preview paths: client NEVER self-confirms payment success.
    // Client displays 'verifying', and if server confirmation has not arrived,
    // transitions to 'uncertain' awaiting webhook settlement.
    const timer = setTimeout(() => {
      setStatus('uncertain');
    }, 2500);

    return () => clearTimeout(timer);
  }, [params.cancel]);

  const handleRecheck = () => {
    setStatus('verifying');
    setTimeout(() => {
      setStatus('uncertain');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <PaymentReturnMatrixPresentation
        status={status}
        bookingCode={params.bookingCode || 'BK-20260928-8921'}
        amountVnd={300000}
        coachName="HLV Hoàng Nam"
        serviceName="Tập sức mạnh cá nhân 1-kèm-1"
        scheduledTime="18:00 - 19:00 • Thứ Hai, 28/09/2026"
        onViewAppointment={() => router.replace('/booking/bk-1' as any)}
        onRetryOrChooseAgain={() => router.replace('/booking/select-slot' as any)}
        onContactSupport={() => router.push('/support/create' as any)}
        onRecheckStatus={handleRecheck}
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
