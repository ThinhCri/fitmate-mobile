import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectServiceSlotPresentation } from '../../src/features/booking/SelectServiceSlotPresentation';
import {
  CoachSummaryViewModel,
  BookingServiceViewModel,
  BookingSlotViewModel,
} from '../../src/features/booking/bookingTypes';
import { trainersService } from '@/services/api/trainersService';
import { mapPTPublicDetailToDetail } from '@/services/api/types';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors, spacing } from '@/theme/designTokens';

const DEFAULT_COACH: CoachSummaryViewModel = {
  id: 'coach-1',
  name: 'HLV Hoàng Nam',
  title: 'Pro PT',
  specialty: 'Thể hình & Sức mạnh',
  rating: 4.9,
  reviewCount: 48,
  isVerified: true,
};

const DEFAULT_SERVICES: BookingServiceViewModel[] = [
  {
    id: 'srv-1',
    name: 'Tập sức mạnh cá nhân 1-kèm-1',
    durationMinutes: 60,
    priceVnd: 300000,
    description: 'Tập trung kỹ thuật tạ đòn, sửa tư thế và kích hoạt cơ bắp chuẩn y sinh học.',
    locationName: 'Fitmate Gym Thảo Điền',
    locationAddress: 'P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
  },
];

export default function SelectSlotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    coachId?: string;
    ptId?: string;
    rescheduleBookingId?: string;
  }>();

  const targetPtId = params.coachId || params.ptId;

  const [coach, setCoach] = useState<CoachSummaryViewModel>(DEFAULT_COACH);
  const [services, setServices] = useState<BookingServiceViewModel[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false);

  // Generate 7 days starting from today
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      dateString: `${year}-${month}-${day}`,
      dayLabel: dayLabels[d.getDay()],
      dateNum: day,
    };
  });

  const [timeSlots, setTimeSlots] = useState<BookingSlotViewModel[]>([
    { id: 's-1', startTime: '08:00', endTime: '09:00', period: 'morning', isAvailable: true },
    { id: 's-2', startTime: '09:30', endTime: '10:30', period: 'morning', isAvailable: true },
    { id: 's-3', startTime: '15:00', endTime: '16:00', period: 'afternoon', isAvailable: true },
    { id: 's-4', startTime: '18:00', endTime: '19:00', period: 'evening', isAvailable: true },
    { id: 's-5', startTime: '19:30', endTime: '20:30', period: 'evening', isAvailable: true },
  ]);

  const fetchCoachData = useCallback(async () => {
    if (!targetPtId) return;
    setLoading(true);
    try {
      const raw = await trainersService.getTrainer(targetPtId);
      const detail = mapPTPublicDetailToDetail(raw);
      setCoach({
        id: detail.id,
        name: detail.name,
        title: 'Pro PT',
        specialty: detail.specialties.join(', ') || 'Thể hình',
        rating: detail.rating,
        reviewCount: detail.reviewCount,
        avatarUrl: detail.avatarUrl ?? undefined,
        isVerified: detail.isVerified,
      });

      if (detail.services && detail.services.length > 0) {
        setServices(
          detail.services.map((s) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            priceVnd: s.priceVnd,
            description: s.description || 'Gói tập cá nhân cùng HLV chuyên nghiệp.',
            locationName: 'Fitmate Partner Studio',
            locationAddress: 'Thành phố Hồ Chí Minh',
          }))
        );
      }
    } catch {
      // Keep defaults on preview / offline
    } finally {
      setLoading(false);
    }
  }, [targetPtId]);

  useEffect(() => {
    fetchCoachData();
  }, [fetchCoachData]);

  const handleContinue = async (serviceId: string, date: string, slotId: string) => {
    const selectedSlot = timeSlots.find((s) => s.id === slotId) || timeSlots[0];
    const selectedService = services.find((s) => s.id === serviceId) || services[0];
    const slotStartUtc = `${date}T${selectedSlot.startTime}:00Z`;

    // Reschedule flow
    if (params.rescheduleBookingId) {
      setHolding(true);
      try {
        const repo = getBookingRepository();
        await repo.rescheduleAppointment(
          params.rescheduleBookingId,
          slotStartUtc,
          'Đề xuất dời lịch tập sang khung giờ mới'
        );
        Alert.alert(
          'Đã gửi yêu cầu dời lịch',
          'Đề xuất đổi lịch đã được gửi tới HLV. Vui lòng chờ phản hồi trong vòng 24 giờ.',
          [{ text: 'Xem lịch hẹn', onPress: () => router.replace('/booking/my-appointments' as any) }]
        );
      } catch (err) {
        Alert.alert(
          'Yêu cầu dời lịch thất bại',
          err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu.'
        );
      } finally {
        setHolding(false);
      }
      return;
    }

    // New booking hold flow
    setHolding(true);
    try {
      const repo = getBookingRepository();
      const hold = await repo.createHold({
        ptId: coach.id,
        serviceId: selectedService.id,
        slotStartUtc,
      });

      router.push({
        pathname: '/booking/confirm' as any,
        params: {
          holdId: hold.holdId,
          coachId: coach.id,
          coachName: coach.name,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          priceVnd: String(selectedService.priceVnd),
          selectedDate: date,
          selectedTimeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
          expiresAt: hold.expiresAtUtc,
        },
      });
    } catch (err) {
      Alert.alert(
        'Không thể giữ chỗ',
        err instanceof Error ? err.message : 'Khung giờ này vừa có người giữ hoặc đặt. Vui lòng chọn khung giờ khác.'
      );
    } finally {
      setHolding(false);
    }
  };

  if (loading || holding) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SelectServiceSlotPresentation
        coach={coach}
        services={services}
        availableDates={availableDates}
        timeSlots={timeSlots}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
