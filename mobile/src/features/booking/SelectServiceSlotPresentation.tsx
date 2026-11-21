import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, MapPin, Star, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import {
  CoachSummaryViewModel,
  BookingServiceViewModel,
  BookingSlotViewModel,
} from './bookingTypes';

export interface SelectServiceSlotPresentationProps {
  coach: CoachSummaryViewModel;
  services: BookingServiceViewModel[];
  availableDates: { dateString: string; dayLabel: string; dateNum: string }[];
  timeSlots: BookingSlotViewModel[];
  onContinue: (serviceId: string, date: string, slotId: string) => void;
  onBookPackage?: (serviceId: string) => void;
  onViewCoachProfile?: () => void;
}

export function SelectServiceSlotPresentation({
  coach,
  services,
  availableDates,
  timeSlots,
  onContinue,
  onBookPackage,
  onViewCoachProfile,
}: SelectServiceSlotPresentationProps) {
  const insets = useSafeAreaInsets();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]?.dateString ?? '');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    timeSlots.find((s) => s.isAvailable)?.id ?? ''
  );
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];
  const visibleSlots = timeSlots.filter((slot) =>
    (!slot.dateString || slot.dateString === selectedDate) &&
    (!selectedService || slot.durationMinutes === undefined || slot.durationMinutes >= selectedService.durationMinutes));

  useEffect(() => {
    if (!services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0]?.id ?? '');
    }
  }, [services, selectedServiceId]);

  useEffect(() => {
    if (!visibleSlots.some((slot) => slot.id === selectedSlotId && slot.isAvailable)) {
      setSelectedSlotId('');
    }
  }, [selectedDate, selectedServiceId, selectedSlotId, timeSlots]);

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

        {/* Section 1: Choose Service Package */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Chọn gói dịch vụ PT</Text>
          </View>

          <View style={styles.servicesList}>
            {services.map((srv) => {
              const isSelected = srv.id === selectedServiceId;
              return (
                <TouchableOpacity
                  key={srv.id}
                  onPress={() => setSelectedServiceId(srv.id)}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`Chọn gói ${srv.name}, giá ${srv.priceVnd.toLocaleString('vi-VN')} đồng`}
                >
                  <Card style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}>
                    <View style={styles.serviceTopRow}>
                      <View style={styles.serviceTitleCol}>
                        <Text style={styles.serviceName}>{srv.name}</Text>
                        <View style={styles.serviceDurationRow}>
                          <Clock size={13} color={colors.textSecondary} />
                          <Text style={styles.serviceDuration}>{srv.durationMinutes} phút / buổi</Text>
                        </View>
                      </View>
                      <View style={styles.servicePriceCol}>
                        <Text style={styles.servicePrice}>
                          {srv.priceVnd.toLocaleString('vi-VN')} ₫
                        </Text>
                        <Text style={styles.perSessionText}>/ buổi</Text>
                      </View>
                    </View>

                    <Text style={styles.serviceDesc}>{srv.description}</Text>
                    {!!srv.targetAudience && <Text style={styles.serviceDesc}>Phù hợp: {srv.targetAudience}</Text>}
                    {!!srv.requiredEquipment && <Text style={styles.serviceDesc}>Chuẩn bị: {srv.requiredEquipment}</Text>}
                    {!!srv.deliverable && <Text style={styles.serviceDesc}>Bạn nhận được: {srv.deliverable}</Text>}

                    <View style={styles.serviceLocRow}>
                      <MapPin size={14} color={colors.primary} />
                      <Text style={styles.serviceLocText} numberOfLines={1}>
                        {srv.deliveryMode === 'online' ? 'Online qua Google Meet' : srv.locationName}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
              return (
                <TouchableOpacity
                  key={d.dateString}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => setSelectedDate(d.dateString)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ngày ${d.dayLabel} ${d.dateNum}`}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dateTextSelected]}>
                    {d.dayLabel}
                  </Text>
                  <Text style={[styles.dateNum, isSelected && styles.dateTextSelected]}>
                    {d.dateNum}
                  </Text>
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

          <View style={styles.slotsGrid}>
            {visibleSlots.length === 0 ? <Text style={styles.serviceDesc}>HLV chưa mở giờ trống cho ngày này. Hãy chọn ngày khác.</Text> : visibleSlots.map((slot) => {
              const isSelected = slot.id === selectedSlotId;
              return (
                <TouchableOpacity
                  key={slot.id}
                  disabled={!slot.isAvailable}
                  style={[
                    styles.slotBtn,
                    isSelected && styles.slotBtnSelected,
                    !slot.isAvailable && styles.slotBtnDisabled,
                  ]}
                  onPress={() => setSelectedSlotId(slot.id)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !slot.isAvailable, selected: isSelected }}
                  accessibilityLabel={`Khung giờ ${slot.startTime} đến ${slot.endTime} ${
                    slot.isAvailable ? 'khả dụng' : 'đã kín'
                  }`}
                >
                  <Text
                    style={[
                      styles.slotText,
                      isSelected && styles.slotTextSelected,
                      !slot.isAvailable && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) + 6 }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomLabel}>Tổng tạm tính:</Text>
          <Text style={styles.bottomPrice}>
            {selectedService ? selectedService.priceVnd.toLocaleString('vi-VN') : '0'} ₫
          </Text>
        </View>

        <View style={styles.bottomBtnCol}>
          <PrimaryButton
            label="Tiếp tục giữ lịch"
            disabled={!selectedServiceId || !selectedDate || !selectedSlotId}
            onPress={handleContinue}
          />
        </View>
      </View>
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
    backgroundColor: '#F0FDFA',
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
    width: 58,
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
});
