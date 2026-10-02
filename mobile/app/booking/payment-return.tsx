import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentReturnMatrixPresentation, PaymentReturnStatus } from '@/features/booking/PaymentReturnMatrixPresentation';
import { bookingService } from '@/services/api/bookingService';
import type { PaymentWire } from '@/services/api/types';

export default function PaymentReturnScreen() {
  const router = useRouter(); const params = useLocalSearchParams<{ paymentId?: string; bookingCode?: string; cancel?: string }>();
  const [payment, setPayment] = useState<PaymentWire | null>(null); const [status, setStatus] = useState<PaymentReturnStatus>(params.cancel === 'true' ? 'canceled' : 'verifying'); const [error, setError] = useState<string>();
  const check = useCallback(async () => { if (params.cancel === 'true') { setStatus('canceled'); return; } if (!params.paymentId) { setStatus('failed'); setError('Thiếu mã giao dịch thanh toán.'); return; } setStatus('verifying'); setError(undefined); try { const result = await bookingService.getMyPayment(params.paymentId); setPayment(result); if (result.status === 'Paid') setStatus('success'); else if (result.status === 'Failed') setStatus('failed'); else if (result.status === 'Refunded' || result.status === 'PartialRefunded') setStatus('canceled'); else setStatus('uncertain'); } catch (e) { setStatus('uncertain'); setError(e instanceof Error ? e.message : 'Không thể kiểm tra trạng thái giao dịch.'); } }, [params.cancel, params.paymentId]);
  useEffect(() => { void check(); }, [check]);
  const appointmentId = payment?.appointment_id;
  return <View style={styles.container}><PaymentReturnMatrixPresentation status={status} bookingCode={params.bookingCode || appointmentId || '—'} amountVnd={payment?.amount_vnd ?? 0} errorMessage={error} onViewAppointment={() => appointmentId ? router.replace(`/booking/${appointmentId}` as never) : router.replace('/booking' as never)} onRetryOrChooseAgain={() => router.replace('/(tabs)/marketplace' as never)} onContactSupport={() => router.push({ pathname: '/support/create' as never, params: appointmentId ? { bookingId: appointmentId } : {} })} onRecheckStatus={() => void check()} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' } });
