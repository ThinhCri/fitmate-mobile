import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, Star, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { PtServicePackageCard } from '../trainer/PtServicePackageCard';
import {
  CoachSummaryViewModel,
  BookingServiceViewModel,
  BookingSlotViewModel,
} from './bookingTypes';

export interface ActiveHoldViewModel {
  appointmentId: string;
  holdId?: string;
  serviceId: string;
  slotStartUtc: string;
  expiresAtUtc: string;
  priceVnd: number;
}

export interface SelectServiceSlotPresentationProps {
  coach: CoachSummaryViewModel;
  services: BookingServiceViewModel[];
  availableDates: { dateString: string; dayLabel: string; dateNum: string }[];
  timeSlots: BookingSlotViewModel[];
  activeHold?: ActiveHoldViewModel | null;
  onContinue: (serviceId: string, date: string, slotId: string) => void;
  onContinueHold?: () => void;
  onCancelHold?: () => void;
  onHoldExpired?: () => void;
  onBookPackage?: (serviceId: string) => void;
  onViewCoachProfile?: () => void;
}

export function SelectServiceSlotPresentation({
  coach,
  services,
  availableDates,
  timeSlots,
  activeHold,
  onContinue,
  onContinueHold,
  onCancelHold,
  onHoldExpired,
  onBookPackage,
  onViewCoachProfile,
}: SelectServiceSlotPresentationProps) {
  const insets = useSafeAreaInsets();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? '');
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!activeHold?.expiresAtUtc) return 0;
    return Math.max(0, Math.floor((new Date(activeHold.expiresAtUtc).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!activeHold?.expiresAtUtc) {
      setRemainingSeconds(0);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(activeHold.expiresAtUtc).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        onHoldExpired?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeHold?.expiresAtUtc, onHoldExpired]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const heldService = activeHold ? services.find((s) => s.id === activeHold.serviceId) : null;
  const heldDate = activeHold ? new Date(activeHold.slotStartUtc) : null;
  const isHeldDateValid = heldDate ? !isNaN(heldDate.getTime()) : false;
  const heldDateStr = isHeldDateValid
    ? heldDate!.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
    : '';
  const heldTimeStr = isHeldDateValid
    ? heldDate!.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';
  const heldDateTimeFormatted = isHeldDateValid ? `${heldTimeStr}, ${heldDateStr}` : 'Khung giờ đã chọn';
  const activeHoldDateString = activeHold && isHeldDateValid
    ? `${heldDate!.getFullYear()}-${String(heldDate!.getMonth() + 1).padStart(2, '0')}-${String(heldDate!.getDate()).padStart(2, '0')}`
    : '';

  // Find the first date that actually has available slots or active hold
  const firstAvailableDate = availableDates.find((d) =>
    timeSlots.some(
      (s) =>
        (s.isAvailable || s.slotStartUtc === activeHold?.slotStartUtc) &&
        s.dateString === d.dateString &&
        (!selectedService || s.durationMinutes === undefined || s.durationMinutes >= selectedService.durationMinutes)
    )
  )?.dateString ?? availableDates[0]?.dateString ?? '';

  const [selectedDate, setSelectedDate] = useState<string>(
    activeHoldDateString || firstAvailableDate
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    timeSlots.find(
      (s) =>
        (activeHold ? s.slotStartUtc === activeHold.slotStartUtc : s.isAvailable) &&
        (!firstAvailableDate || s.dateString === (activeHoldDateString || firstAvailableDate))
    )?.id ?? ''
  );

  const visibleSlots = timeSlots.filter(
    (slot) =>
      (!slot.dateString || slot.dateString === selectedDate) &&
      (!selectedService || slot.durationMinutes === undefined || slot.durationMinutes >= selectedService.durationMinutes)
  );

  useEffect(() => {
    if (activeHold && activeHoldDateString) {
      setSelectedDate(activeHoldDateString);
      const matchingSlot = timeSlots.find((s) => s.slotStartUtc === activeHold.slotStartUtc);
      if (matchingSlot) {
        setSelectedSlotId(matchingSlot.id);
      }
      if (activeHold.serviceId && services.some((s) => s.id === activeHold.serviceId)) {
        setSelectedServiceId(activeHold.serviceId);
      }
    }
  }, [activeHold, activeHoldDateString, services, timeSlots]);

  useEffect(() => {
    if (!services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0]?.id ?? '');
    }
  }, [services, selectedServiceId]);

  // When switching service or if current date has no slots, attempt to switch to first date with available slots
  useEffect(() => {
    const hasSlotsOnCurrentDate = timeSlots.some(
      (s) =>
        (s.isAvailable || s.slotStartUtc === activeHold?.slotStartUtc) &&
        s.dateString === selectedDate &&
        (!selectedService || s.durationMinutes === undefined || s.durationMinutes >= selectedService.durationMinutes)
    );
    if (!hasSlotsOnCurrentDate && firstAvailableDate && firstAvailableDate !== selectedDate && !activeHoldDateString) {
      setSelectedDate(firstAvailableDate);
    }
  }, [activeHold?.slotStartUtc, activeHoldDateString, firstAvailableDate, selectedService, selectedDate, timeSlots]);

  useEffect(() => {
    if (!visibleSlots.some((slot) => slot.id === selectedSlotId && (slot.isAvailable || slot.slotStartUtc === activeHold?.slotStartUtc))) {
      const firstSlot = visibleSlots.find((s) => s.isAvailable || s.slotStartUtc === activeHold?.slotStartUtc);
      setSelectedSlotId(firstSlot?.id ?? '');
    }
  }, [activeHold?.slotStartUtc, selectedDate, selectedServiceId, selectedSlotId, visibleSlots]);

  const handleContinue = () => {
    if (selectedServiceId && selectedDate && selectedSlotId) {
      onContinue(selectedServiceId, selectedDate, selectedSlotId);
    }
  };

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 170 + Math.max(insets.bottom, spacing.sm) }]}>
        {/* Step Micro-Indicator */}
        <View style={styles.stepTrack}>
          <View style={styles.stepProgress} />
        </View>

        {/* PT Summary Header Card */}
        <Card style={styles.coachCard}>
          <TouchableOpacity
            style={styles.coachRow}
            onPress={onViewCoachProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Xem hồ sơ của huấn luyện viên ${coach.name}`}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{coach.name.charAt(0)}</Text>
              {coach.isVerified && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.coachInfo}>
              <View style={styles.coachNameRow}>
                <Text style={styles.coachName}>{coach.name}</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>{coach.title || 'Pro PT'}</Text>
                </View>
              </View>
              <Text style={styles.coachSpecialty}>{coach.specialty}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingValue}>{coach.rating === null ? 'Chưa có số liệu' : coach.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({coach.reviewCount === null ? 'Chưa tải số' : coach.reviewCount} đánh giá)</Text>
              </View>
            </View>

            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Active Hold Banner (Chờ thanh toán) */}
        {activeHold && remainingSeconds > 0 && (
          <Card style={styles.holdBannerCard}>
            <View style={styles.holdBannerHeader}>
              <View style={styles.holdBannerIconWrap}>
                <Clock size={18} color="#D97706" />
              </View>
              <View style={styles.holdBannerHeaderText}>
                <View style={styles.holdBadgeRow}>
                  <View style={styles.holdBadge}>
                    <Text style={styles.holdBadgeText}>Chờ thanh toán</Text>
                  </View>
                  <Text style={styles.holdTimerText}>
                    Hết hạn sau: <Text style={styles.holdTimerValue}>{timeFormatted}</Text>
                  </Text>
                </View>
                <Text style={styles.holdBannerTitle}>Bạn có 1 lịch hẹn đang chờ thanh toán</Text>
                <Text style={styles.holdBannerSubtitle}>
                  {heldService?.name ?? 'Buổi tập cá nhân'} • {heldDateTimeFormatted}
                </Text>
              </View>
            </View>

            <View style={styles.holdBannerActions}>
              {onContinueHold && (
                <TouchableOpacity
                  style={styles.holdActionPayBtn}
                  onPress={onContinueHold}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Tiếp tục thanh toán cho khung giờ đang giữ"
                >
                  <Text style={styles.holdActionPayText}>Tiếp tục thanh toán</Text>
                </TouchableOpacity>
              )}
              {onCancelHold && (
                <TouchableOpacity
                  style={styles.holdActionCancelBtn}
                  onPress={onCancelHold}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Hủy giữ chỗ khung giờ này"
                >
                  <Text style={styles.holdActionCancelText}>Hủy giữ chỗ</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        {/* Section 1: Choose Service Package */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Chọn gói dịch vụ PT</Text>
          </View>

          <View style={styles.servicesList}>
            {services.map((srv) => (
              <PtServicePackageCard
                key={srv.id}
                service={srv}
                selectable
                selected={srv.id === selectedServiceId}
                onPress={() => setSelectedServiceId(srv.id)}
              />
            ))}
          </View>
        </View>

        {/* If trainer has no available slots at all in the 7 days */}
        {timeSlots.length === 0 ? (
          <Card style={styles.noScheduleCard}>
            <View style={styles.noScheduleHeader}>
              <View style={styles.noScheduleIconWrap}>
                <AlertCircle size={24} color="#F59E0B" />
              </View>
              <View style={styles.noScheduleTextCol}>
                <Text style={styles.noScheduleTitle}>HLV chưa cập nhật lịch rảnh</Text>
                <Text style={styles.noScheduleDesc}>
                  Huấn luyện viên {coach.name} hiện chưa cài đặt khung giờ dạy trống trong 7 ngày tới. Bạn vui lòng quay lại sau hoặc liên hệ trao đổi với HLV để mở lịch trước khi đặt.
                </Text>
              </View>
            </View>
            {onViewCoachProfile && (
              <TouchableOpacity
                style={styles.noScheduleBtn}
                onPress={onViewCoachProfile}
                accessibilityRole="button"
                accessibilityLabel="Xem hồ sơ và liên hệ huấn luyện viên"
              >
                <Text style={styles.noScheduleBtnText}>Xem hồ sơ HLV</Text>
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          <>
            {/* Section 2: Choose Date */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>Chọn ngày tập</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateChipsRow}
              >
                {availableDates.map((d) => {
                  const isSelected = d.dateString === selectedDate;
                  const daySlots = timeSlots.filter(
                    (s) =>
                      s.isAvailable &&
                      s.dateString === d.dateString &&
                      (!selectedService ||
                        s.durationMinutes === undefined ||
                        s.durationMinutes >= selectedService.durationMinutes)
                  );
                  const hasSlots = daySlots.length > 0;

                  return (
                    <TouchableOpacity
                      key={d.dateString}
                      style={[
                        styles.dateChip,
                        isSelected && styles.dateChipSelected,
                        !hasSlots && styles.dateChipEmpty,
                      ]}
                      onPress={() => setSelectedDate(d.dateString)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ngày ${d.dayLabel} ${d.dateNum}, ${
                        hasSlots ? `${daySlots.length} ca trống` : 'Hết ca trống'
                      }`}
                    >
                      <Text style={[styles.dayLabel, isSelected && styles.dateTextSelected, !hasSlots && styles.textMuted]}>
                        {d.dayLabel}
                      </Text>
                      <Text style={[styles.dateNum, isSelected && styles.dateTextSelected, !hasSlots && styles.textMuted]}>
                        {d.dateNum}
                      </Text>
                      <View
                        style={[
                          styles.slotBadge,
                          hasSlots
                            ? isSelected
                              ? styles.slotBadgeSelected
                              : styles.slotBadgeAvailable
                            : styles.slotBadgeEmpty,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotBadgeText,
                            isSelected && styles.dateTextSelected,
                            !hasSlots && styles.slotBadgeTextEmpty,
                          ]}
                        >
                          {hasSlots ? `${daySlots.length} ca` : 'Trống'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Section 3: Choose Time Slot */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
              </View>

              {visibleSlots.length === 0 ? (
                <View style={styles.emptySlotsBox}>
                  <Clock size={28} color={colors.textMuted} />
                  <Text style={styles.emptySlotsTitle}>Không có ca trống trong ngày này</Text>
                  <Text style={styles.emptySlotsDesc}>
                    HLV chưa mở lịch dạy hoặc các ca trong ngày đã kín. Vui lòng bấm chọn các ngày khác có hiển thị số ca trống ở trên.
                  </Text>
                </View>
              ) : (
                <View style={styles.slotsGrid}>
                  {visibleSlots.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;
                    const isHeld = Boolean(
                      slot.isHeldByMe || (activeHold && slot.slotStartUtc === activeHold.slotStartUtc)
                    );
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        disabled={!slot.isAvailable && !isHeld}
                        style={[
                          styles.slotBtn,
                          isSelected && styles.slotBtnSelected,
                          isHeld && !isSelected && styles.slotBtnHeld,
                          !slot.isAvailable && !isHeld && styles.slotBtnDisabled,
                        ]}
                        onPress={() => setSelectedSlotId(slot.id)}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !slot.isAvailable && !isHeld, selected: isSelected }}
                        accessibilityLabel={`Khung giờ ${slot.startTime} đến ${slot.endTime} ${
                          isHeld ? 'đang chờ thanh toán' : slot.isAvailable ? 'khả dụng' : 'đã kín'
                        }`}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            isSelected && styles.slotTextSelected,
                            isHeld && !isSelected && styles.slotTextHeld,
                            !slot.isAvailable && !isHeld && styles.slotTextDisabled,
                          ]}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Text>
                        {isHeld && (
                          <View style={styles.slotHeldTag}>
                            <Clock size={10} color={isSelected ? '#FFFFFF' : '#B45309'} />
                            <Text style={[styles.slotHeldTagText, isSelected && { color: '#FFFFFF' }]}>
                              Chờ thanh toán
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      {onBookPackage && selectedServiceId &&
        ((selectedService?.package4PriceVnd ?? 0) > 0 || (selectedService?.package8PriceVnd ?? 0) > 0) && (
          <TouchableOpacity onPress={() => onBookPackage(selectedServiceId)}
            accessibilityRole="button" accessibilityLabel="Đặt gói bốn hoặc tám buổi với dịch vụ đã chọn"
            style={[styles.packageBar, { bottom: 68 + Math.max(insets.bottom, spacing.sm) }]}>
            <Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center' }}>Chọn gói 4 hoặc 8 buổi</Text>
          </TouchableOpacity>
        )}
      {(() => {
        const selectedSlot = visibleSlots.find((s) => s.id === selectedSlotId);
        const isSelectedSlotHeld = Boolean(
          selectedSlot && (selectedSlot.isHeldByMe || (activeHold && selectedSlot.slotStartUtc === activeHold.slotStartUtc))
        );
        const handleBottomPress = () => {
          if (isSelectedSlotHeld && onContinueHold) {
            onContinueHold();
          } else {
            handleContinue();
          }
        };

        return (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) + 6 }]}>
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomLabel}>Tổng tạm tính:</Text>
              <Text style={styles.bottomPrice}>
                {isSelectedSlotHeld && activeHold?.priceVnd
                  ? activeHold.priceVnd.toLocaleString('vi-VN')
                  : selectedService
                  ? selectedService.priceVnd.toLocaleString('vi-VN')
                  : '0'}{' '}
                ₫
              </Text>
            </View>

            <View style={styles.bottomBtnCol}>
              <PrimaryButton
                label={
                  isSelectedSlotHeld && remainingSeconds > 0
                    ? `Tiếp tục thanh toán (${timeFormatted})`
                    : timeSlots.length === 0
                    ? 'Chưa có lịch để đặt'
                    : 'Tiếp tục giữ lịch'
                }
                disabled={
                  (!isSelectedSlotHeld && timeSlots.length === 0) ||
                  !selectedServiceId ||
                  !selectedDate ||
                  !selectedSlotId
                }
                onPress={handleBottomPress}
              />
            </View>
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  stepTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  stepProgress: {
    height: '100%',
    width: '33%',
    backgroundColor: colors.primary,
  },
  coachCard: {
    padding: spacing.md,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  coachInfo: {
    flex: 1,
    gap: 2,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  proBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  coachSpecialty: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  servicesList: {
    gap: spacing.sm,
  },
  serviceCard: {
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.primary,
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceTitleCol: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  servicePriceCol: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  perSessionText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  serviceDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  serviceLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  serviceLocText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  dateChip: {
    width: 62,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  dateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipEmpty: {
    opacity: 0.55,
    borderColor: colors.borderSubtle,
  },
  slotBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  slotBadgeAvailable: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  slotBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  slotBadgeEmpty: {
    backgroundColor: 'transparent',
  },
  slotBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  slotBadgeTextEmpty: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  textMuted: {
    color: colors.textMuted,
  },
  noScheduleCard: {
    padding: spacing.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  noScheduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  noScheduleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noScheduleTextCol: {
    flex: 1,
    gap: 4,
  },
  noScheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noScheduleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  noScheduleBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noScheduleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  emptySlotsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emptySlotsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  emptySlotsDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  slotBtn: {
    width: '48%',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  slotBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotBtnDisabled: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
    opacity: 0.4,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextDisabled: {
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  packageBar: {
    position: 'absolute', bottom: 80, left: 0, right: 0,
    minHeight: 44, justifyContent: 'center', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomBtnCol: {
    flex: 1.5,
  },
  holdBannerCard: {
    padding: spacing.md,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  holdBannerHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  holdBannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  holdBannerHeaderText: {
    flex: 1,
    gap: 2,
  },
  holdBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  holdBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  holdBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  holdTimerText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  holdTimerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  holdBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#78350F',
  },
  holdBannerSubtitle: {
    fontSize: 13,
    color: '#92400E',
  },
  holdBannerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  holdActionPayBtn: {
    flex: 1.5,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdActionPayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  holdActionCancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D97706',
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdActionCancelText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '600',
  },
  slotBtnHeld: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    backgroundColor: '#FFFBEB',
  },
  slotTextHeld: {
    color: '#B45309',
    fontWeight: '700',
  },
  slotHeldTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  slotHeldTagText: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '600',
  },
});
