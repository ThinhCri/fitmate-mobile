import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  PaymentReturnMatrixPresentation,
  PaymentReturnStatus,
} from '../../src/features/booking/PaymentReturnMatrixPresentation';

export default function PaymentReturnScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentReturnStatus>('verifying');

  useEffect(() => {
    // Realistic verification simulation
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <PaymentReturnMatrixPresentation
        status={status}
        bookingCode="BK-20260928-8921"
        amountVnd={300000}
        coachName="HLV Hoàng Nam"
        serviceName="Tập sức mạnh cá nhân 1-kèm-1"
        scheduledTime="18:00 - 19:00 • Thứ Hai, 28/09/2026"
        onViewAppointment={() => router.replace('/booking/bk-1' as any)}
        onRetryOrChooseAgain={() => router.replace('/booking/select-slot' as any)}
        onContactSupport={() => router.push('/support/new' as any)}
        onRecheckStatus={() => setStatus('verifying')}
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
