import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ReviewPtPresentation } from '@/features/booking/ReviewPtPresentation';
import type { BookingAppointmentViewModel } from '@/features/booking/bookingTypes';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors } from '@/theme/designTokens';

export default function ReviewPtScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const [appointment, setAppointment] = useState<BookingAppointmentViewModel | null>(null);
  const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0); const [busy, setBusy] = useState(false);
  const pending = useRef(false); const epoch = useRef(0);
  useFocusEffect(useCallback(() => {
    const version = ++epoch.current; pending.current = false; setBusy(false); setAppointment(null); setError('');
    if (!bookingId) { setError('Thiếu mã lịch hẹn. Vui lòng mở đánh giá từ lịch hẹn đã hoàn tất.'); return; }
    void getBookingRepository().getAppointmentDetail(bookingId).then(value => {
      if (epoch.current !== version) return;
      if (!value.canReview) { setError('Chỉ đánh giá lịch hẹn đã hoàn tất.'); return; }
      setAppointment(value);
    }).catch(e => { if (epoch.current === version) setError(e instanceof Error ? e.message : 'Không tải được lịch hẹn.'); });
    return () => { epoch.current++; };
  }, [bookingId, attempt]));
  const submit = async (rating: number, feedback: string) => {
    if (pending.current || !appointment || !Number.isInteger(rating) || rating < 1 || rating > 5) return;
    pending.current = true; setBusy(true); const version = epoch.current;
    try {
      await getBookingRepository().submitReview(appointment.coach.id, rating, feedback);
      if (epoch.current === version) Alert.alert('Đã gửi đánh giá', 'Cảm ơn bạn đã chia sẻ trải nghiệm.', [{ text: 'Quay lại', onPress: () => router.back() }]);
    } catch (e) { if (epoch.current === version) Alert.alert('Chưa gửi được đánh giá', e instanceof Error ? e.message : 'Vui lòng thử lại.'); }
    finally { if (epoch.current === version) { pending.current = false; setBusy(false); } }
  };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 16 }} onPress={() => router.back()}><Text>← Quay lại</Text></TouchableOpacity>
    {appointment ? <ReviewPtPresentation key={appointment.id} initialData={{ bookingId: appointment.id, coachName: appointment.coach.name,
      serviceName: appointment.serviceName, rating: 0, feedbackText: '' }} onSubmitReview={(rating, feedback) => void submit(rating, feedback)} isSubmitting={busy} />
      : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>{error ? <><Text accessibilityRole="alert">{error}</Text><TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => setAttempt(x => x + 1)}><Text>Thử lại</Text></TouchableOpacity></> : <ActivityIndicator />}</View>}
  </SafeAreaView>;
}
