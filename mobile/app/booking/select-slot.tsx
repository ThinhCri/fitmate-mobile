import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectServiceSlotPresentation } from '../../src/features/booking/SelectServiceSlotPresentation';
import {
  CoachSummaryViewModel,
  BookingServiceViewModel,
  BookingSlotViewModel,
} from '../../src/features/booking/bookingTypes';
import { trainersService } from '@/services/api/trainersService';
import { ptService } from '@/services/api/ptService';
import type { AvailabilitySlot } from '@/services/api/types';
import { mapPTPublicDetailToDetail } from '@/services/api/types';
import { getBookingRepository } from '@/repositories/bookingRepository';
import { colors, spacing } from '@/theme/designTokens';

export default function SelectSlotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    coachId?: string;
    ptId?: string;
    rescheduleBookingId?: string;
  }>();

  const targetPtId = params.coachId || params.ptId;

  const [coach, setCoach] = useState<CoachSummaryViewModel | null>(null);
  const [services, setServices] = useState<BookingServiceViewModel[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');

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

  const timeSlots: BookingSlotViewModel[] = availableSlots.filter((slot) => slot.status === 'open' && new Date(slot.slot_start_utc).getTime() > Date.now() + 30 * 60 * 1000).map((slot) => {
    const local = slot.slot_start_local;
    const startTime = local.slice(11, 16);
    const [hour, minute] = startTime.split(':').map(Number);
    const endMinutes = hour * 60 + minute + slot.duration_minutes;
    const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    return { id: slot.id, dateString: local.slice(0, 10), startTime, endTime, durationMinutes: slot.duration_minutes, period: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening', isAvailable: true };
  });

  const fetchCoachData = useCallback(async () => {
    if (!targetPtId) { setError('Thiếu thông tin huấn luyện viên.'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const [raw, slots] = await Promise.all([
        trainersService.getTrainer(targetPtId),
        ptService.getTrainerAvailability(targetPtId, {
          from: new Date().toISOString(),
          to: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ]);
      const detail = mapPTPublicDetailToDetail(raw);
      if (!detail.isVerified) throw new Error('Huấn luyện viên này chưa được xác minh để nhận lịch đặt.');
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

      setServices(
          (detail.services || []).filter((service) => service.isActive &&
            (service.deliveryMode === 'online' || (!!service.locationName && !!service.locationAddress))).map((s) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            priceVnd: s.priceVnd,
            package4PriceVnd: s.package4PriceVnd,
            package8PriceVnd: s.package8PriceVnd,
            description: s.description,
            locationName: s.locationName ?? '',
            locationAddress: s.locationAddress ?? '',
            deliveryMode: s.deliveryMode,
            serviceKind: s.serviceKind,
            targetAudience: s.targetAudience,
            requiredEquipment: s.requiredEquipment,
            deliverable: s.deliverable,
          }))
        );
      setAvailableSlots(slots);
    } catch (reason) {
      setCoach(null);
      setServices([]);
      setAvailableSlots([]);
      setError(reason instanceof Error ? reason.message : 'Không thể tải lịch trống của huấn luyện viên.');
    } finally {
      setLoading(false);
    }
  }, [targetPtId]);

  useEffect(() => {
    fetchCoachData();
  }, [fetchCoachData]);

  const handleContinue = async (serviceId: string, date: string, slotId: string) => {
    const selectedSlot = timeSlots.find((s) => s.id === slotId && s.dateString === date);
    const actualSlot = availableSlots.find((s) => s.id === slotId && s.status === 'open');
    const selectedService = services.find((s) => s.id === serviceId);
    if (!coach || !selectedSlot || !actualSlot || !selectedService) {
      Alert.alert('Lịch đã thay đổi', 'Vui lòng tải lại giờ trống và chọn lại.');
      return;
    }
    const slotStartUtc = actualSlot.slot_start_utc;

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
          appointmentId: hold.appointmentId,
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

  if (error || !coach || services.length === 0) {
    return <View style={[styles.container, styles.center]}><Text style={styles.message}>{error || 'HLV chưa có dịch vụ đang mở để đặt lịch.'}</Text><TouchableOpacity onPress={() => void fetchCoachData()} accessibilityRole="button"><Text style={styles.retry}>Thử lại</Text></TouchableOpacity></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <SelectServiceSlotPresentation
        coach={coach}
        services={services}
        availableDates={availableDates}
        timeSlots={timeSlots}
        onContinue={handleContinue}
        onBookPackage={params.rescheduleBookingId ? undefined : (serviceId) => router.push({
          pathname: '/booking/package-create' as never,
          params: { ptId: coach.id, serviceId },
        })}
        onViewCoachProfile={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  retry: { color: colors.primary, fontWeight: '700', padding: spacing.md },
});
