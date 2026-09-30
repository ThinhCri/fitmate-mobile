import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MyAppointmentsPresentation } from '../../src/features/booking/MyAppointmentsPresentation';
import { BookingAppointmentViewModel } from '../../src/features/booking/bookingTypes';

const MOCK_MY_APPOINTMENTS: BookingAppointmentViewModel[] = [
  {
    id: 'bk-1',
    bookingCode: 'BK-20260928-8921',
    coach: {
      id: 'coach-1',
      name: 'HLV Hoàng Nam',
      title: 'Pro PT',
      specialty: 'Thể hình & Sức mạnh',
      rating: 4.9,
      reviewCount: 48,
      isVerified: true,
    },
    serviceName: 'Tập sức mạnh cá nhân 1-kèm-1',
    scheduledDate: 'Thứ Hai, 28/09/2026',
    scheduledTime: '18:00 - 19:00',
    location: 'Fitmate Gym Thảo Điền',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    paidAmountVnd: 300000,
    createdAt: '2026-09-28T10:00:00Z',
    canCancel: true,
    canReschedule: true,
    canReview: false,
  },
  {
    id: 'bk-2',
    bookingCode: 'BK-20260920-1120',
    coach: {
      id: 'coach-2',
      name: 'HLV Minh Trang',
      title: 'Senior Yoga PT',
      specialty: 'Yoga phục hồi & Căng cơ',
      rating: 5.0,
      reviewCount: 65,
      isVerified: true,
    },
    serviceName: 'Yoga trị liệu cá nhân 1-1',
    scheduledDate: '20/09/2026',
    scheduledTime: '07:30 - 08:30',
    location: 'Fitmate Studio Quận 3',
    bookingStatus: 'completed',
    paymentStatus: 'paid',
    paidAmountVnd: 350000,
    createdAt: '2026-09-18T14:00:00Z',
    canCancel: false,
    canReschedule: false,
    canReview: true,
  },
];

export default function MyAppointmentsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MyAppointmentsPresentation
        appointments={MOCK_MY_APPOINTMENTS}
        onSelectAppointment={(id) => router.push(`/booking/${id}` as any)}
        onExploreTrainers={() => router.push('/(tabs)/trainers' as any)}
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
