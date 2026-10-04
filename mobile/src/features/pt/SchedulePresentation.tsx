import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarCheck,
  Moon,
  AlertTriangle,
  Sun,
  Lock,
  PlusCircle,
  X,
  CheckCircle,
  Repeat,
  Trash2,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import type { AvailabilitySlot, AvailabilitySlotInput } from '@/services/api/types';

export interface ScheduleDay {
  dayLabel: string; // T2..CN
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  isToday: boolean;
}

export interface SchedulePresentationProps {
  daysOfWeek: ScheduleDay[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  slots: AvailabilitySlot[];
  loading: boolean;
  saving: boolean;
  error?: string | null;
  timezone?: string;
  onRefresh?: () => void;
  onBack: () => void;
  onSaveSchedule: (newSlots: AvailabilitySlotInput[]) => Promise<void>;
}

export function SchedulePresentation({
  daysOfWeek,
  selectedDayIndex,
  onSelectDay,
  weekLabel,
  onPrevWeek,
  onNextWeek,
  slots,
  loading,
  saving,
  error,
  timezone = 'Asia/Ho_Chi_Minh',
  onRefresh,
  onBack,
  onSaveSchedule,
}: SchedulePresentationProps) {
  const selectedDay = daysOfWeek[selectedDayIndex] || daysOfWeek[0];
  const [isDayOff, setIsDayOff] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Form states for adding slot
  const [startHour, setStartHour] = useState('07');
  const [startMinute, setStartMinute] = useState('00');
  const [durationMinutes, setDurationMinutes] = useState('60');

  // Weekly open slots synchronized with authoritative server slots
  const [weeklyOpenSlots, setWeeklyOpenSlots] = useState<AvailabilitySlotInput[]>([]);

  useEffect(() => {
    const serverOpenSlots = slots
      .filter((s) => s.status === 'open')
      .map((s) => ({
        slot_start_local: s.slot_start_local,
        duration_minutes: s.duration_minutes,
      }));
    setWeeklyOpenSlots(serverOpenSlots);
  }, [slots]);

  // Open slots for selected day
  const dayOpenSlots = useMemo(() => {
    if (!selectedDay) return [];
    return weeklyOpenSlots
      .filter((s) => s.slot_start_local.startsWith(selectedDay.dateStr))
      .sort((a, b) => a.slot_start_local.localeCompare(b.slot_start_local));
  }, [weeklyOpenSlots, selectedDay]);

  // Booked or held slots for selected day (from server, immutable/protected)
  const dayBookedSlots = useMemo(() => {
    if (!selectedDay) return [];
    return slots
      .filter(
        (s) =>
          s.slot_start_local.startsWith(selectedDay.dateStr) &&
          (s.status === 'booked' || s.status === 'held')
      )
      .sort((a, b) => a.slot_start_local.localeCompare(b.slot_start_local));
  }, [slots, selectedDay]);

  const openSlotsCount = dayOpenSlots.length;

  const handleAddSlotConfirm = () => {
    const h = parseInt(startHour, 10);
    const m = parseInt(startMinute, 10);
    const dur = parseInt(durationMinutes, 10);

    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Giờ không hợp lệ', 'Vui lòng nhập giờ từ 00 đến 23 và phút từ 00 đến 59');
      return;
    }
    if (isNaN(dur) || dur < 15 || dur > 240) {
      Alert.alert('Thời lượng không hợp lệ', 'Thời lượng buổi tập phải từ 15 đến 240 phút');
      return;
    }

    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const timeStr = `${pad(h)}:${pad(m)}:00`;
    const slotStartLocal = `${selectedDay.dateStr}T${timeStr}`;

    const newStartMs = new Date(slotStartLocal).getTime();
    const newEndMs = newStartMs + dur * 60 * 1000;

    // Strict interval overlap check [start, end) across dayOpenSlots and dayBookedSlots
    const allDaySlots = [
      ...dayOpenSlots,
      ...dayBookedSlots.map((b) => ({
        slot_start_local: b.slot_start_local,
        duration_minutes: b.duration_minutes,
      })),
    ];
    const hasOverlap = allDaySlots.some((s) => {
      const sStartMs = new Date(s.slot_start_local).getTime();
      const sEndMs = sStartMs + s.duration_minutes * 60 * 1000;
      return newStartMs < sEndMs && sStartMs < newEndMs;
    });

    if (hasOverlap) {
      Alert.alert(
        'Trùng lặp khung giờ',
        'Khung giờ bạn chọn bị giao thoa (overlap) với một khung giờ đã tồn tại trên lịch.'
      );
      return;
    }

    setWeeklyOpenSlots((prev) => [
      ...prev,
      {
        slot_start_local: slotStartLocal,
        duration_minutes: dur,
      },
    ]);
    setAddModalVisible(false);
  };

  const handleRemoveOpenSlot = (slotToRemove: AvailabilitySlotInput) => {
    setWeeklyOpenSlots((prev) =>
      prev.filter(
        (s) =>
          s.slot_start_local !== slotToRemove.slot_start_local ||
          s.duration_minutes !== slotToRemove.duration_minutes
      )
    );
  };

  const handleToggleDayOff = (value: boolean) => {
    setIsDayOff(value);
    if (value && dayOpenSlots.length > 0) {
      Alert.alert(
        'Đánh dấu ngày nghỉ',
        `Xóa toàn bộ ${dayOpenSlots.length} ca rảnh trống trong ngày ${selectedDay?.dayLabel}? Các ca đã có người đặt vẫn được giữ nguyên.`,
        [
          { text: 'Giữ lại ca rảnh', style: 'cancel' },
          {
            text: 'Xóa ca rảnh',
            style: 'destructive',
            onPress: () => {
              setWeeklyOpenSlots((prev) =>
                prev.filter((s) => !s.slot_start_local.startsWith(selectedDay.dateStr))
              );
            },
          },
        ]
      );
    }
  };

  const handleSavePress = () => {
    Alert.alert(
      'Xác nhận lưu lịch',
      `Lưu sẽ cập nhật lại các khung giờ rảnh (Open) trong ${weekLabel}. Các ca đã có học viên đặt (Booked) hoặc đang giữ chỗ (Held) sẽ được bảo toàn nguyên vẹn.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận lưu',
          onPress: () => {
            onSaveSchedule(weeklyOpenSlots);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Lịch Dạy PT</Text>
        <View style={styles.headerAvatar}>
          <UserIcon size={18} color={colors.white} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        {/* Week Switcher Card */}
        <View style={styles.weekCard}>
          <View style={styles.weekHeaderRow}>
            <Pressable onPress={onPrevWeek} style={styles.weekNavBtn}>
              <ChevronLeft size={20} color={colors.textSecondary} />
            </Pressable>

            <View style={styles.weekCenterCol}>
              <Text style={styles.weekTitle}>{weekLabel}</Text>
              <View style={styles.tzRow}>
                <Clock size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.tzText}>Múi giờ chuẩn: {timezone}</Text>
              </View>
            </View>

            <Pressable onPress={onNextWeek} style={styles.weekNavBtn}>
              <ChevronRight size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Weekly Day Picker Strip */}
          <View style={styles.dayStripRow}>
            {daysOfWeek.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <Pressable
                  key={day.dayLabel + idx}
                  style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                  onPress={() => onSelectDay(idx)}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dayTextSelected]}>
                    {day.dayLabel}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayTextSelected]}>
                    {day.dayNum < 10 ? '0' + day.dayNum : day.dayNum}
                  </Text>
                  <View
                    style={[
                      styles.dayDot,
                      isSelected ? styles.dayDotSelected : styles.dayDotUnselected,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Authoritative Error State */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {onRefresh ? (
              <Pressable style={styles.retryBtn} onPress={onRefresh}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Summary Metric Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIcon}>
              <CalendarCheck size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.summaryLabel}>
                Tổng khả dụng {selectedDay?.dayLabel} ({selectedDay?.dateStr})
              </Text>
              <Text style={styles.summaryDetails}>
                {openSlotsCount} khung giờ rảnh đang mở nhận
              </Text>
            </View>
          </View>
          <View style={styles.openStatusBadge}>
            <Text style={styles.openStatusText}>{isDayOff ? 'Ngày nghỉ' : 'Đang mở nhận'}</Text>
          </View>
        </View>

        {/* Day-Off Exception Setting */}
        <View style={styles.dayOffCard}>
          <View style={styles.dayOffRow}>
            <View style={styles.dayOffLeft}>
              <View style={styles.moonIcon}>
                <Moon size={18} color={colors.warning} />
              </View>
              <View>
                <Text style={styles.dayOffTitle}>Đánh dấu ngày nghỉ (Day-off)</Text>
                <Text style={styles.dayOffSubtitle}>
                  Tạm ngưng mở nhận ca mới trong {selectedDay?.dayLabel} này
                </Text>
              </View>
            </View>
            <Switch
              value={isDayOff}
              onValueChange={handleToggleDayOff}
              trackColor={{ false: colors.border, true: colors.warning }}
              thumbColor={colors.white}
            />
          </View>

          {isDayOff ? (
            <View style={styles.dayOffWarning}>
              <AlertTriangle size={18} color={colors.warning} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.dayOffWarningText}>
                Nếu ngày có lịch hẹn đã chốt, bạn phải yêu cầu đổi lịch hoặc thông báo khách trước, hệ thống không tự động hủy lịch đã thanh toán.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Availability Intervals List */}
        <View style={styles.intervalsSection}>
          <View style={styles.intervalsHeader}>
            <View style={styles.intervalsTitleRow}>
              <Text style={styles.intervalsTitle}>Khung Giờ Nhận Khách</Text>
              <View style={styles.slotsCountBadge}>
                <Text style={styles.slotsCountText}>
                  {dayBookedSlots.length + dayOpenSlots.length} ca
                </Text>
              </View>
            </View>
            <Text style={styles.selectedDaySub}>{selectedDay?.dayLabel}, {selectedDay?.dateStr}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải khung giờ...</Text>
            </View>
          ) : null}

          {/* Server Booked / Held Slots (Protected) */}
          {dayBookedSlots.map((slot) => {
            const startT = slot.slot_start_local.split('T')[1]?.substring(0, 5) || '07:00';
            const isHeld = slot.status === 'held';
            return (
              <View key={slot.id} style={styles.bookedSlotCard}>
                <View style={styles.bookedSlotRow}>
                  <View style={styles.bookedIcon}>
                    <Lock size={18} color={isHeld ? colors.warning : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.bookedBadgeRow}>
                      <Text style={styles.bookedTimeRange}>{startT}</Text>
                      <View
                        style={[
                          styles.bookedTag,
                          isHeld && { backgroundColor: colors.warningLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bookedTagText,
                            isHeld && { color: colors.warning },
                          ]}
                        >
                          {isHeld ? 'Đang giữ chỗ' : 'Đã có lịch hẹn'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.bookedClientText}>
                      Thời lượng {slot.duration_minutes} phút (Không thể chỉnh sửa hoặc xóa)
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Open Slots */}
          {dayOpenSlots.map((slot, index) => {
            const startT = slot.slot_start_local.split('T')[1]?.substring(0, 5) || '00:00';
            return (
              <View key={`${slot.slot_start_local}-${index}`} style={styles.openSlotCard}>
                <View style={styles.openSlotLeft}>
                  <View style={styles.openSlotIcon}>
                    <Sun size={20} color={colors.primary} />
                  </View>
                  <View>
                    <View style={styles.openBadgeRow}>
                      <Text style={styles.openTimeRange}>{startT}</Text>
                      <View style={styles.openTag}>
                        <Text style={styles.openTagText}>Trống</Text>
                      </View>
                    </View>
                    <Text style={styles.openDuration}>
                      Sẵn sàng nhận khách ({slot.duration_minutes} phút)
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleRemoveOpenSlot(slot)}
                  style={styles.deleteSlotBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Xóa khung giờ rảnh"
                >
                  <Trash2 size={16} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}

          {/* Quick Add Slot Action */}
          {!isDayOff ? (
            <Pressable
              style={styles.addSlotBtn}
              onPress={() => setAddModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Thêm khung giờ rảnh mới"
            >
              <PlusCircle size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.addSlotText}>+ Thêm khung giờ rảnh mới</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Action Footer */}
        <View style={styles.footerSection}>
          <View style={styles.scopedNoticeBox}>
            <CheckCircle
              size={18}
              color={colors.primary}
              style={{ marginRight: 8, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.scopedNoticeTitle}>Cập nhật theo tuần</Text>
              <Text style={styles.scopedNoticeText}>
                Lưu lịch sẽ cập nhật lại các ca rảnh (Open) trong tuần đang xem. Các ca đã có người đặt (Booked) hoặc đang giữ chỗ (Held) luôn được bảo vệ an toàn.
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.repeatBtn, { opacity: 0.6 }]}
            onPress={() => {
              Alert.alert(
                'Chưa khả dụng',
                'Tính năng tự động nhân bản lịch định kỳ [CAPABILITY_GATED] chưa được hỗ trợ bởi hệ thống máy chủ.'
              );
            }}
          >
            <Repeat size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <Text style={[styles.repeatBtnText, { color: colors.textMuted }]}>
              Áp dụng định kỳ (Chưa khả dụng)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.saveBtn,
              (loading || saving) && { opacity: 0.6 },
            ]}
            onPress={handleSavePress}
            disabled={loading || saving}
            accessibilityRole="button"
            accessibilityLabel="Lưu lịch rảnh tuần này"
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 8 }} />
            ) : (
              <CheckCircle size={18} color={colors.white} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.saveBtnText}>
              {saving ? 'Đang lưu lịch...' : 'Lưu lịch tuần này'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Khung Giờ Mới</Text>
              <Pressable onPress={() => setAddModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.timeInputsRow}>
              <View style={styles.timeInputCol}>
                <Text style={styles.inputLabel}>Giờ bắt đầu (0-23)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={startHour}
                  onChangeText={setStartHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={styles.timeInputCol}>
                <Text style={styles.inputLabel}>Phút (0-59)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={startMinute}
                  onChangeText={setStartMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={styles.timeInputCol}>
                <Text style={styles.inputLabel}>Thời lượng (phút)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="numeric"
                  placeholder="60"
                />
              </View>
            </View>

            <View style={styles.overlapInfoBox}>
              <CheckCircle size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.overlapInfoText}>
                Hệ thống tự động kiểm tra tính hợp lệ và tránh trùng lặp khung giờ.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelModalBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.confirmModalBtn}
                onPress={handleAddSlotConfirm}
              >
                <Text style={styles.confirmModalText}>Xác nhận thêm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekNavBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekCenterCol: {
    alignItems: 'center',
  },
  weekTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  tzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tzText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    minWidth: 42,
  },
  dayItemSelected: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayNum: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    marginTop: 4,
  },
  dayDotSelected: {
    backgroundColor: colors.warning,
  },
  dayDotUnselected: {
    backgroundColor: 'transparent',
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryDetails: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  openStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  openStatusText: {
    ...typography.captionMedium,
    color: colors.success,
  },
  dayOffCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayOffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayOffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  moonIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dayOffTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  dayOffSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayOffWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  dayOffWarningText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  intervalsSection: {
    marginBottom: spacing.lg,
  },
  intervalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  intervalsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalsTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  slotsCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    marginLeft: 6,
  },
  slotsCountText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  selectedDaySub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loadingBox: {
    padding: spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bookedSlotCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bookedSlotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bookedTimeRange: {
    ...typography.bodyBold,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  bookedTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  bookedTagText: {
    ...typography.captionMedium,
    color: colors.white,
    fontSize: 10,
  },
  bookedClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bookedClientText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bookingCode: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  dot: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  clientName: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lockNotice: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  lockIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  openSlotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  openSlotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  openSlotIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  openBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openTimeRange: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  openTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  openTagText: {
    ...typography.captionMedium,
    color: colors.success,
    fontSize: 11,
  },
  openDuration: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteSlotBtn: {
    padding: spacing.sm,
  },
  addSlotBtn: {
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSubtle,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addSlotText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  footerSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  repeatBtn: {
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  repeatBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  saveBtn: {
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeInputCol: {
    flex: 1,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timeInput: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
  },
  overlapInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  overlapInfoText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  confirmModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  gapNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  gapNoticeTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    marginBottom: 2,
    fontWeight: '700',
  },
  gapNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  scopedNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  scopedNoticeTitle: {
    ...typography.captionMedium,
    color: colors.primary,
    marginBottom: 2,
    fontWeight: '700',
  },
  scopedNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  retryText: {
    ...typography.captionMedium,
    color: colors.danger,
  },
});
