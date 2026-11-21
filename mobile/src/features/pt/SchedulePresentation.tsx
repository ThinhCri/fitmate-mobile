import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Check,
  Sliders,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import type { AvailabilitySlot, AvailabilitySlotInput } from '@/services/api/types';

const MORNING_SLOTS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'];
const AFTERNOON_SLOTS = ['13:00', '14:00', '15:00', '16:00', '17:00'];
const EVENING_SLOTS = ['18:00', '19:00', '20:00', '21:00'];
const DURATION_OPTIONS = [
  { label: '45 phút', value: 45 },
  { label: '60 phút (chuẩn)', value: 60 },
  { label: '90 phút', value: 90 },
  { label: '120 phút', value: 120 },
];
const CUSTOM_HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const CUSTOM_MINUTES = [0, 15, 30, 45];

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
  const insets = useSafeAreaInsets();
  const selectedDay = daysOfWeek[selectedDayIndex] || daysOfWeek[0];
  const [isDayOff, setIsDayOff] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Touch-friendly slot adding state
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedQuickSlots, setSelectedQuickSlots] = useState<string[]>([]);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customHour, setCustomHour] = useState(7);
  const [customMinute, setCustomMinute] = useState(0);

  // Weekly open slots synchronized with authoritative server slots
  const [weeklyOpenSlots, setWeeklyOpenSlots] = useState<AvailabilitySlotInput[]>([]);

  useEffect(() => {
    const serverOpenSlots = slots
      .filter((s) => s.status === 'open')
      .map((s) => ({
        slot_start_local: s.slot_start_local,
        duration_minutes: s.duration_minutes,
        trainer_timezone: timezone,
      }));
    setWeeklyOpenSlots(serverOpenSlots);
  }, [slots, timezone]);

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

  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  const customTimeStr = `${pad(customHour)}:${pad(customMinute)}`;

  const getSlotStatus = useCallback(
    (timeStr: string, durMinutes: number) => {
      if (!selectedDay) return { isBooked: false, isOpen: false, isAvailable: true };
      const slotStartLocal = `${selectedDay.dateStr}T${timeStr}:00`;
      const startMs = new Date(slotStartLocal).getTime();
      const endMs = startMs + durMinutes * 60 * 1000;

      // Check booked/held slots
      const isBooked = dayBookedSlots.some((b) => {
        const bStart = new Date(b.slot_start_local).getTime();
        const bEnd = bStart + b.duration_minutes * 60 * 1000;
        return startMs < bEnd && bStart < endMs;
      });

      // Check already open slots
      const isOpen = dayOpenSlots.some((o) => {
        const oStart = new Date(o.slot_start_local).getTime();
        const oEnd = oStart + o.duration_minutes * 60 * 1000;
        return startMs < oEnd && oStart < endMs;
      });

      return {
        isBooked,
        isOpen,
        isAvailable: !isBooked && !isOpen,
      };
    },
    [selectedDay, dayBookedSlots, dayOpenSlots]
  );

  const handleToggleQuickSlot = (timeStr: string) => {
    setSelectedQuickSlots((prev) =>
      prev.includes(timeStr) ? prev.filter((t) => t !== timeStr) : [...prev, timeStr]
    );
  };

  const handleSelectAllMorning = () => {
    const available = MORNING_SLOTS.filter(
      (t) => getSlotStatus(t, selectedDuration).isAvailable
    );
    setSelectedQuickSlots((prev) => Array.from(new Set([...prev, ...available])));
  };

  const handleSelectAllEvening = () => {
    const available = EVENING_SLOTS.filter(
      (t) => getSlotStatus(t, selectedDuration).isAvailable
    );
    setSelectedQuickSlots((prev) => Array.from(new Set([...prev, ...available])));
  };

  const handleClearSelection = () => {
    setSelectedQuickSlots([]);
  };

  const handleAddQuickSlotsConfirm = () => {
    if (selectedQuickSlots.length === 0) {
      Alert.alert('Chưa chọn ca', 'Vui lòng chọn ít nhất một khung giờ rảnh.');
      return;
    }

    const sortedTimes = [...selectedQuickSlots].sort();
    // Strict interval overlap check within chosen batch
    for (let i = 0; i < sortedTimes.length - 1; i++) {
      const currentStart = new Date(`${selectedDay.dateStr}T${sortedTimes[i]}:00`).getTime();
      const currentEnd = currentStart + selectedDuration * 60 * 1000;
      const nextStart = new Date(`${selectedDay.dateStr}T${sortedTimes[i + 1]}:00`).getTime();
      if (currentEnd > nextStart) {
        Alert.alert(
          'Khung giờ giao thoa',
          `Ca ${sortedTimes[i]} (${selectedDuration} phút) bị giao thoa với ca ${sortedTimes[i + 1]}. Vui lòng bỏ chọn bớt hoặc giảm thời lượng buổi tập.`
        );
        return;
      }
    }

    // Check overlap against existing slots
    for (const timeStr of sortedTimes) {
      const status = getSlotStatus(timeStr, selectedDuration);
      if (!status.isAvailable) {
        Alert.alert('Khung giờ không khả dụng', `Ca ${timeStr} trùng lặp với lịch đã có.`);
        return;
      }
    }

    const newSlots: AvailabilitySlotInput[] = sortedTimes.map((timeStr) => ({
      slot_start_local: `${selectedDay.dateStr}T${timeStr}:00`,
      duration_minutes: selectedDuration,
      trainer_timezone: timezone,
    }));

    setWeeklyOpenSlots((prev) => [...prev, ...newSlots]);
    setSelectedQuickSlots([]);
    setAddModalVisible(false);
  };

  const handleAddCustomSlot = () => {
    const status = getSlotStatus(customTimeStr, selectedDuration);
    if (status.isBooked) {
      Alert.alert('Không khả dụng', `Khung giờ ${customTimeStr} trùng với ca đã có người đặt/giữ chỗ.`);
      return;
    }
    if (status.isOpen) {
      Alert.alert('Trùng lặp', `Khung giờ ${customTimeStr} đã có trên lịch rảnh của bạn.`);
      return;
    }

    const newSlot: AvailabilitySlotInput = {
      slot_start_local: `${selectedDay.dateStr}T${customTimeStr}:00`,
      duration_minutes: selectedDuration,
      trainer_timezone: timezone,
    };

    setWeeklyOpenSlots((prev) => [...prev, newSlot]);
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

  const renderSlotChip = (timeStr: string) => {
    const status = getSlotStatus(timeStr, selectedDuration);
    const isSelected = selectedQuickSlots.includes(timeStr);

    if (status.isBooked) {
      return (
        <View key={timeStr} style={[styles.slotChip, styles.slotChipBooked]}>
          <Lock size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
          <Text style={styles.slotChipTextBooked}>{timeStr}</Text>
          <Text style={styles.slotChipSubBooked}>Đã đặt</Text>
        </View>
      );
    }

    if (status.isOpen) {
      return (
        <View key={timeStr} style={[styles.slotChip, styles.slotChipOpen]}>
          <Check size={12} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={styles.slotChipTextOpen}>{timeStr}</Text>
          <Text style={styles.slotChipSubOpen}>Đã có</Text>
        </View>
      );
    }

    return (
      <Pressable
        key={timeStr}
        style={[styles.slotChip, isSelected && styles.slotChipSelected]}
        onPress={() => handleToggleQuickSlot(timeStr)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`Khung giờ ${timeStr}`}
      >
        {isSelected ? (
          <CheckCircle size={14} color={colors.white} style={{ marginRight: 4 }} />
        ) : null}
        <Text style={[styles.slotChipText, isSelected && styles.slotChipTextSelected]}>
          {timeStr}
        </Text>
      </Pressable>
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

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
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
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdropDismiss}
            onPress={() => setAddModalVisible(false)}
            accessibilityLabel="Đóng popup"
          />
          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
          >
            {/* Grab handle indicator */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Thêm Khung Giờ Rảnh</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedDay?.dayLabel}, {selectedDay?.dateStr}
                </Text>
              </View>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={styles.closeModalBtn}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Duration Selector */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>1. Thời lượng buổi tập</Text>
                <View style={styles.chipRow}>
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = selectedDuration === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        style={[
                          styles.durationChip,
                          isSelected && styles.durationChipSelected,
                        ]}
                        onPress={() => setSelectedDuration(opt.value)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                      >
                        <Text
                          style={[
                            styles.durationChipText,
                            isSelected && styles.durationChipTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Quick Select Actions */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeadingRow}>
                  <Text style={styles.sectionHeading}>2. Chọn các ca rảnh (Chạm để chọn)</Text>
                </View>
                <View style={styles.quickActionRow}>
                  <Pressable
                    style={styles.quickActionBtn}
                    onPress={handleSelectAllMorning}
                  >
                    <Sun size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.quickActionText}>Chọn cả sáng</Text>
                  </Pressable>
                  <Pressable
                    style={styles.quickActionBtn}
                    onPress={handleSelectAllEvening}
                  >
                    <Moon size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.quickActionText}>Chọn cả tối</Text>
                  </Pressable>
                  {selectedQuickSlots.length > 0 && (
                    <Pressable
                      style={styles.quickClearBtn}
                      onPress={handleClearSelection}
                    >
                      <Text style={styles.quickClearText}>Bỏ chọn ({selectedQuickSlots.length})</Text>
                    </Pressable>
                  )}
                </View>

                {/* Morning Slots */}
                <Text style={styles.timeGroupTitle}>🌅 Buổi sáng</Text>
                <View style={styles.slotsGrid}>
                  {MORNING_SLOTS.map((timeStr) => renderSlotChip(timeStr))}
                </View>

                {/* Afternoon Slots */}
                <Text style={styles.timeGroupTitle}>☀️ Buổi chiều</Text>
                <View style={styles.slotsGrid}>
                  {AFTERNOON_SLOTS.map((timeStr) => renderSlotChip(timeStr))}
                </View>

                {/* Evening Slots */}
                <Text style={styles.timeGroupTitle}>🌙 Buổi tối</Text>
                <View style={styles.slotsGrid}>
                  {EVENING_SLOTS.map((timeStr) => renderSlotChip(timeStr))}
                </View>
              </View>

              {/* Custom Time Toggle */}
              <View style={styles.customSectionBlock}>
                <Pressable
                  style={styles.customToggleRow}
                  onPress={() => setShowCustomTime((v) => !v)}
                >
                  <View style={styles.customToggleLeft}>
                    <Sliders size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.customToggleTitle}>
                      {showCustomTime ? 'Ẩn tùy chỉnh giờ lẻ' : '+ Tùy chỉnh giờ lẻ / giờ khác'}
                    </Text>
                  </View>
                  <ChevronRight
                    size={16}
                    color={colors.textSecondary}
                    style={{ transform: [{ rotate: showCustomTime ? '90deg' : '0deg' }] }}
                  />
                </Pressable>

                {showCustomTime && (
                  <View style={styles.customTimeCard}>
                    <Text style={styles.customTimeLabel}>Giờ bắt đầu:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hoursScroll}>
                      {CUSTOM_HOURS.map((h) => {
                        const isSelected = customHour === h;
                        return (
                          <Pressable
                            key={h}
                            style={[styles.hourChip, isSelected && styles.hourChipSelected]}
                            onPress={() => setCustomHour(h)}
                          >
                            <Text style={[styles.hourChipText, isSelected && styles.hourChipTextSelected]}>
                              {pad(h)}h
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <Text style={[styles.customTimeLabel, { marginTop: 8 }]}>Phút:</Text>
                    <View style={styles.minutesRow}>
                      {CUSTOM_MINUTES.map((m) => {
                        const isSelected = customMinute === m;
                        return (
                          <Pressable
                            key={m}
                            style={[styles.minuteChip, isSelected && styles.minuteChipSelected]}
                            onPress={() => setCustomMinute(m)}
                          >
                            <Text style={[styles.minuteChipText, isSelected && styles.minuteChipTextSelected]}>
                              :{pad(m)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <View style={styles.customPreviewRow}>
                      <Text style={styles.customPreviewText}>
                        Khung giờ: <Text style={styles.customPreviewHighlight}>{customTimeStr}</Text> ({selectedDuration} phút)
                      </Text>
                      <Pressable
                        style={styles.addCustomBtn}
                        onPress={handleAddCustomSlot}
                      >
                        <Text style={styles.addCustomBtnText}>Thêm ca này</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelModalBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Đóng</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmModalBtn,
                  selectedQuickSlots.length === 0 && styles.confirmModalBtnDisabled,
                ]}
                onPress={handleAddQuickSlotsConfirm}
                disabled={selectedQuickSlots.length === 0}
              >
                <CheckCircle size={18} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.confirmModalText}>
                  {selectedQuickSlots.length === 0
                    ? 'Chưa chọn ca'
                    : `Thêm ${selectedQuickSlots.length} ca rảnh`}
                </Text>
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
  modalBackdropDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: 460,
  },
  sectionBlock: {
    marginBottom: spacing.md,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionHeading: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationChipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  durationChipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  quickActionText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontSize: 11,
  },
  quickClearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  quickClearText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 11,
  },
  timeGroupTitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotChipText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  slotChipTextSelected: {
    color: colors.white,
  },
  slotChipBooked: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    opacity: 0.5,
  },
  slotChipTextBooked: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  slotChipSubBooked: {
    fontSize: 9,
    color: colors.textMuted,
    marginLeft: 3,
  },
  slotChipOpen: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  slotChipTextOpen: {
    ...typography.captionMedium,
    color: colors.success,
    fontSize: 12,
  },
  slotChipSubOpen: {
    fontSize: 9,
    color: colors.success,
    marginLeft: 3,
  },
  customSectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  customToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  customToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customToggleTitle: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  customTimeCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  customTimeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  hoursScroll: {
    marginBottom: spacing.xs,
  },
  hourChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  hourChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hourChipText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  hourChipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  minutesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  minuteChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  minuteChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  minuteChipText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  minuteChipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  customPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  customPreviewText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  customPreviewHighlight: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  addCustomBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  addCustomBtnText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xs,
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
    flex: 1.5,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalBtnDisabled: {
    backgroundColor: colors.border,
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
