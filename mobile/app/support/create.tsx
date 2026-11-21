import { colors } from '@/theme/designTokens';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CreateTicketPresentation, CreateTicketFormValues } from '@/features/support';
import { getSupportRepository } from '@/repositories/supportRepository';

export default function CreateTicketScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const submit = async (values: CreateTicketFormValues) => { setSubmitting(true); try { const ticket = await getSupportRepository().createTicket(values); Alert.alert('Đã gửi yêu cầu', 'Bộ phận hỗ trợ đã tiếp nhận yêu cầu của bạn.', [{ text: 'Xem yêu cầu', onPress: () => router.replace(`/support/${ticket.id}` as never) }]); } catch (e) { Alert.alert('Không thể gửi yêu cầu', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSubmitting(false); } };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><CreateTicketPresentation initialValues={{ linkedBookingId: bookingId, category: bookingId ? 'booking_dispute' : 'other' }} isSubmitting={submitting} onBack={() => router.back()} onSubmit={submit} /></SafeAreaView>;
}
