import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  SelectServiceSlotPresentation,
  ActiveHoldViewModel,
} from '../../src/features/booking/SelectServiceSlotPresentation';
import {
  CoachSummaryViewModel,
  BookingServiceViewModel,
  BookingSlotViewModel,
} from '../../src/features/booking/bookingTypes';
import { trainersService } from '@/services/api/trainersService';
import { ptService } from '@/services/api/ptService';
import { bookingService } from '@/services/api/bookingService';
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
  const [activeHold, setActiveHold] = useState<ActiveHoldViewModel | null>(null);
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

  const timeSlots: BookingSlotViewModel[] = availableSlots
    .filter(
      (slot) =>
        (slot.status === 'open' || (activeHold && slot.slot_start_utc === activeHold.slotStartUtc)) &&
        new Date(slot.slot_start_utc).getTime() > Date.now() + 30 * 60 * 1000
    )
    .map((slot) => {
      const local = slot.slot_start_local;
      const startTime = local.slice(11, 16);
      const [hour, minute] = startTime.split(':').map(Number);
      const endMinutes = hour * 60 + minute + slot.duration_minutes;
      const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(
        endMinutes % 60
      ).padStart(2, '0')}`;
      const isHeld = Boolean(activeHold && slot.slot_start_utc === activeHold.slotStartUtc);

      return {
        id: slot.id,
        dateString: local.slice(0, 10),
        slotStartUtc: slot.slot_start_utc,
        startTime,
        endTime,
        durationMinutes: slot.duration_minutes,
        period: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
        isAvailable: slot.status === 'open',
        isHeldByMe: isHeld,
      };
    });

  // Ensure active hold slot is always in timeSlots even if backend availability omitted it
  if (activeHold) {
    const holdExists = timeSlots.some((s) => s.slotStartUtc === activeHold.slotStartUtc);
    if (!holdExists) {
      const heldD = new Date(activeHold.slotStartUtc);
      if (!isNaN(heldD.getTime())) {
        const year = heldD.getFullYear();
        const month = String(heldD.getMonth() + 1).padStart(2, '0');
        const day = String(heldD.getDate()).padStart(2, '0');
        const hour = heldD.getHours();
        const minute = heldD.getMinutes();
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const heldSvc = services.find((s) => s.id === activeHold.serviceId);
        const dur = heldSvc?.durationMinutes ?? 60;
        const endMinutes = hour * 60 + minute + dur;
        const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(
          endMinutes % 60
        ).padStart(2, '0')}`;

        timeSlots.push({
          id: `held-${activeHold.appointmentId}`,
          dateString: `${year}-${month}-${day}`,
          slotStartUtc: activeHold.slotStartUtc,
          startTime,
          endTime,
          durationMinutes: dur,
          period: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
          isAvailable: true,
          isHeldByMe: true,
        });
      }
    }
  }

  const fetchCoachData = useCallback(async () => {
    if (!targetPtId) {
      setError('Thiếu thông tin huấn luyện viên.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [raw, slots, myBookings] = await Promise.all([
        trainersService.getTrainer(targetPtId),
        ptService.getTrainerAvailability(targetPtId, {
          from: new Date().toISOString(),
          to: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        bookingService.listMyBookings({ status: 'Held' }).catch(() => ({ items: [] })),
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

      const loadedServices = (detail.services || [])
        .filter(
          (service) =>
            service.isActive &&
            (service.deliveryMode === 'online' || (!!service.locationName && !!service.locationAddress))
        )
        .map((s) => ({
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
        }));
      setServices(loadedServices);
      setAvailableSlots(slots);

      // Check for active hold by current member for this trainer
      const now = Date.now();
      const validHold = (myBookings.items || []).find(
        (b) =>
          b.pt_user_id === targetPtId &&
          b.status === 'Held' &&
          b.hold_expires_at_utc &&
          new Date(b.hold_expires_at_utc).getTime() > now
      );

      if (validHold) {
        setActiveHold({
          appointmentId: validHold.id,
          holdId: validHold.id,
          serviceId: validHold.service_id,
          slotStartUtc: validHold.slot_start_utc,
          expiresAtUtc: validHold.hold_expires_at_utc!,
          priceVnd: validHold.price_listed_vnd - (validHold.discount_vnd || 0),
        });
      } else {
        setActiveHold(null);
      }
    } catch (reason) {
      setCoach(null);
      setServices([]);
      setAvailableSlots([]);
      setActiveHold(null);
      setError(reason instanceof Error ? reason.message : 'Không thể tải lịch trống của huấn luyện viên.');
    } finally {
      setLoading(false);
    }
  }, [targetPtId]);

  useEffect(() => {
    fetchCoachData();
    // Tự động làm mới danh sách ca rảnh mỗi 10 giây để phản ánh realtime các ca vừa có người giữ/đặt
    const timer = setInterval(() => {
      fetchCoachData();
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchCoachData]);

  const handleContinueHold = () => {
    if (!activeHold || !coach) return;
    const service = services.find((s) => s.id === activeHold.serviceId) || services[0];
    const slotDate = new Date(activeHold.slotStartUtc);
    const dateString = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(
      slotDate.getDate()
    ).padStart(2, '0')}`;
    const hours = String(slotDate.getHours()).padStart(2, '0');
    const mins = String(slotDate.getMinutes()).padStart(2, '0');
    const endD = new Date(slotDate.getTime() + (service?.durationMinutes ?? 60) * 60000);
    const endHours = String(endD.getHours()).padStart(2, '0');
    const endMins = String(endD.getMinutes()).padStart(2, '0');

    router.push({
      pathname: '/booking/confirm' as any,
      params: {
        holdId: activeHold.holdId || activeHold.appointmentId,
        appointmentId: activeHold.appointmentId,
        coachId: coach.id,
        coachName: coach.name,
        serviceId: service?.id || activeHold.serviceId,
        serviceName: service?.name || 'Buổi tập cá nhân',
        priceVnd: String(activeHold.priceVnd || service?.priceVnd || 0),
        selectedDate: dateString,
        selectedTimeSlot: `${hours}:${mins} - ${endHours}:${endMins}`,
        expiresAt: activeHold.expiresAtUtc,
      },
    });
  };

  const handleCancelHold = () => {
    if (!activeHold) return;
    Alert.alert(
      'Hủy giữ chỗ',
      'Bạn có chắc chắn muốn hủy đơn giữ chỗ này để chọn khung giờ khác không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy giữ chỗ',
          style: 'destructive',
          onPress: async () => {
            setHolding(true);
            try {
              await bookingService.cancelMyBooking(
                activeHold.appointmentId,
                'Hủy giữ chỗ để chọn khung giờ khác'
              );
              setActiveHold(null);
              Alert.alert('Thành công', 'Đã hủy giữ chỗ. Khung giờ đã được giải phóng để bạn chọn lại.');
              await fetchCoachData();
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Không thể hủy giữ chỗ lúc này.';
              Alert.alert('Lỗi hủy giữ chỗ', msg);
            } finally {
              setHolding(false);
            }
          },
        },
      ]
    );
  };

  const handleHoldExpired = () => {
    setActiveHold(null);
    Alert.alert(
      'Hết thời gian giữ chỗ',
      'Thời gian giữ chỗ 10 phút đã hết hạn. Đơn giữ chỗ đã được hủy tự động. Bạn vui lòng chọn lại khung giờ.',
      [{ text: 'Đồng ý', onPress: () => void fetchCoachData() }]
    );
  };

  const proceedCreateHold = async (
    selectedService: BookingServiceViewModel,
    slotStartUtc: string,
    date: string,
    selectedSlot: BookingSlotViewModel
  ) => {
    setHolding(true);
    try {
      const repo = getBookingRepository();
      const hold = await repo.createHold({
        ptId: coach!.id,
        serviceId: selectedService.id,
        slotStartUtc,
      });

      router.push({
        pathname: '/booking/confirm' as any,
        params: {
          holdId: hold.holdId,
          appointmentId: hold.appointmentId,
          coachId: coach!.id,
          coachName: coach!.name,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          priceVnd: String(selectedService.priceVnd),
          selectedDate: date,
          selectedTimeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
          expiresAt: hold.expiresAtUtc,
        },
      });
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : '';
      const friendlyMsg =
        rawMsg.includes('no longer available') ||
        rawMsg.includes('SlotTaken') ||
        rawMsg.includes('giữ chỗ') ||
        rawMsg.includes('người đặt') ||
        rawMsg.includes('overlap')
          ? 'Khung giờ này vừa có người đặt hoặc đang được giữ chỗ. Vui lòng chọn khung giờ khác.'
          : rawMsg || 'Khung giờ này vừa có người đặt hoặc đang được giữ chỗ. Vui lòng chọn khung giờ khác.';
      Alert.alert('Không thể giữ chỗ', friendlyMsg);
      await fetchCoachData();
    } finally {
      setHolding(false);
    }
  };

  const handleContinue = async (serviceId: string, date: string, slotId: string) => {
    const selectedSlot = timeSlots.find((s) => s.id === slotId && s.dateString === date);
    const actualSlot = availableSlots.find((s) => s.id === slotId);
    const selectedService = services.find((s) => s.id === serviceId);
    if (!coach || !selectedSlot || !selectedService) {
      Alert.alert('Lịch đã thay đổi', 'Vui lòng tải lại giờ trống và chọn lại.');
      return;
    }
    const slotStartUtc = selectedSlot.slotStartUtc || actualSlot?.slot_start_utc;
    if (!slotStartUtc) {
      Alert.alert('Lỗi khung giờ', 'Không tìm thấy thời gian bắt đầu của khung giờ.');
      return;
    }

    // If this slot is already held by the current user, continue payment directly!
    if (activeHold && activeHold.slotStartUtc === slotStartUtc) {
      handleContinueHold();
      return;
    }

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

    // If user already has an active hold on another slot with this coach, prompt to cancel old hold first
    if (activeHold && activeHold.slotStartUtc !== slotStartUtc) {
      Alert.alert(
        'Đổi sang khung giờ mới?',
        'Bạn đang có 1 đơn giữ chỗ chưa thanh toán. Bạn có muốn hủy đơn cũ để chuyển sang khung giờ mới này không?',
        [
          { text: 'Giữ đơn cũ', style: 'cancel' },
          {
            text: 'Đổi giờ mới',
            onPress: async () => {
              setHolding(true);
              try {
                await bookingService.cancelMyBooking(
                  activeHold.appointmentId,
                  'Hủy đơn cũ để chuyển sang khung giờ mới'
                );
              } catch (err) {
                console.warn('Server error on cancel old hold:', err);
              }
              setActiveHold(null);
              try {
                await proceedCreateHold(selectedService, slotStartUtc, date, selectedSlot);
              } finally {
                setHolding(false);
              }
            },
          },
        ]
      );
      return;
    }

    // New booking hold flow
    await proceedCreateHold(selectedService, slotStartUtc, date, selectedSlot);
  };

  if (loading || holding) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !coach || services.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.message}>{error || 'HLV chưa có dịch vụ đang mở để đặt lịch.'}</Text>
        <TouchableOpacity onPress={() => void fetchCoachData()} accessibilityRole="button">
          <Text style={styles.retry}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <SelectServiceSlotPresentation
        coach={coach}
        services={services}
        availableDates={availableDates}
        timeSlots={timeSlots}
        activeHold={activeHold}
        onContinue={handleContinue}
        onContinueHold={handleContinueHold}
        onCancelHold={handleCancelHold}
        onHoldExpired={handleHoldExpired}
        onBookPackage={
          params.rescheduleBookingId
            ? undefined
            : (serviceId) =>
                router.push({
                  pathname: '/booking/package-create' as never,
                  params: { ptId: coach.id, serviceId },
                })
        }
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
