import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectServiceSlotPresentation } from '../../src/features/booking/SelectServiceSlotPresentation';
import {
  CoachSummaryViewModel,
  BookingServiceViewModel,
  BookingSlotViewModel,
} from '../../src/features/booking/bookingTypes';

const MOCK_COACH: CoachSummaryViewModel = {
  id: 'coach-1',
  name: 'HLV Hoàng Nam',
  title: 'Pro PT',
  specialty: 'Thể hình & Dinh dưỡng cá nhân hoá',
  rating: 4.9,
  reviewCount: 48,
  isVerified: true,
};

const MOCK_SERVICES: BookingServiceViewModel[] = [
  {
    id: 'srv-1',
    name: 'Tập sức mạnh cá nhân 1-kèm-1',
    durationMinutes: 60,
    priceVnd: 300000,
    description:
      'Tập trung kỹ thuật tạ đòn, sửa tư thế và kích hoạt cơ bắp chuẩn y sinh học. Tối ưu theo chỉ số cơ thể.',
    locationName: 'Fitmate Gym Thảo Điền',
    locationAddress: 'P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
  },
  {
    id: 'srv-2',
    name: 'Tập giảm mỡ & Thể lực chuyên sâu (HIIT + Strength)',
    durationMinutes: 60,
    priceVnd: 350000,
    description:
      'Kết hợp tạ liên hoàn và bài tập chức năng tăng cường trao đổi chất và sức bền tim mạch.',
    locationName: 'Fitmate Gym Quận 1',
    locationAddress: 'Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
  },
];

const MOCK_DATES = [
  { dateString: '2026-09-28', dayLabel: 'T2', dateNum: '28' },
  { dateString: '2026-09-29', dayLabel: 'T3', dateNum: '29' },
  { dateString: '2026-09-30', dayLabel: 'T4', dateNum: '30' },
  { dateString: '2026-10-01', dayLabel: 'T5', dateNum: '01' },
  { dateString: '2026-10-02', dayLabel: 'T6', dateNum: '02' },
];

const MOCK_SLOTS: BookingSlotViewModel[] = [
  { id: 's-1', startTime: '08:00', endTime: '09:00', period: 'morning', isAvailable: true },
  { id: 's-2', startTime: '09:30', endTime: '10:30', period: 'morning', isAvailable: false },
  { id: 's-3', startTime: '15:00', endTime: '16:00', period: 'afternoon', isAvailable: true },
  { id: 's-4', startTime: '18:00', endTime: '19:00', period: 'evening', isAvailable: true },
  { id: 's-5', startTime: '19:30', endTime: '20:30', period: 'evening', isAvailable: false },
];

export default function SelectSlotScreen() {
  const router = useRouter();

  const handleContinue = (_serviceId: string, _date: string, _slotId: string) => {
    router.push('/booking/confirm' as any);
  };

  return (
    <View style={styles.container}>
      <SelectServiceSlotPresentation
        coach={MOCK_COACH}
        services={MOCK_SERVICES}
        availableDates={MOCK_DATES}
        timeSlots={MOCK_SLOTS}
        onContinue={handleContinue}
        onViewCoachProfile={() => router.back()}
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
