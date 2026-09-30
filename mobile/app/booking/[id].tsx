import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppointmentDetailPresentation } from '../../src/features/booking/AppointmentDetailPresentation';
import { BookingAppointmentViewModel } from '../../src/features/booking/bookingTypes';

const MOCK_APPOINTMENT: BookingAppointmentViewModel = {
  id: 'bk-1',
  bookingCode: 'BK-20260928-8921',
  coach: {
    id: 'coach-1',
    name: 'HLV Hoàng Nam',
    title: 'Pro PT',
    specialty: 'Thể hình & Dinh dưỡng',
    rating: 4.95,
    reviewCount: 48,
    isVerified: true,
  },
  serviceName: 'Tập sức mạnh cá nhân 1-kèm-1',
  scheduledDate: 'Thứ Hai, 28/09/2026',
  scheduledTime: '18:00 - 19:00 (60 phút)',
  location: 'Fitmate Gym Thảo Điền (P. Thảo Điền, TP. Thủ Đức)',
  bookingStatus: 'confirmed',
  paymentStatus: 'paid',
  paidAmountVnd: 300000,
  createdAt: '2026-09-28T10:00:00Z',
  canCancel: true,
  canReschedule: true,
  canReview: false,
};

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <AppointmentDetailPresentation
        appointment={{
          ...MOCK_APPOINTMENT,
          id: id || MOCK_APPOINTMENT.id,
        }}
        onCancelBooking={() => router.push('/booking/cancel-refund' as any)}
        onReschedule={() => router.push('/booking/select-slot' as any)}
        onReviewPt={() => router.push('/booking/review' as any)}
        onMessageCoach={() => router.push('/chat/coach-1' as any)}
        onContactSupport={() => router.push('/support/new' as any)}
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
