import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { ptService } from '@/services/api/ptService';
import type { AvailabilitySlot, AvailabilitySlotInput } from '@/services/api/types';
import {
  SchedulePresentation,
  ScheduleDay,
} from '@/features/pt/SchedulePresentation';

export default function ScheduleRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate days of the week based on current week offset and date query bounds
  const { daysOfWeek, weekLabel, fromDateStr, toDateStr } = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday + currentWeekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const days: ScheduleDay[] = [];
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === d.getMonth() &&
        today.getDate() === d.getDate();

      days.push({
        dayLabel: dayLabels[i],
        dateStr,
        dayNum: d.getDate(),
        isToday,
      });
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const label = `Tuần (${pad(monday.getDate())}/${pad(monday.getMonth() + 1)} - ${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}/${sunday.getFullYear()})`;

    return {
      daysOfWeek: days,
      weekLabel: label,
      fromDateStr: days[0].dateStr,
      toDateStr: days[6].dateStr,
    };
  }, [currentWeekOffset]);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ptService.getMyAvailability({
        from: fromDateStr,
        to: toDateStr,
      });
      setSlots(result || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải lịch khả dụng từ máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }, [fromDateStr, toDateStr]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleSaveSchedule = async (newSlots: AvailabilitySlotInput[]) => {
    setSaving(true);
    try {
      await ptService.setMyAvailability(
        { from: fromDateStr, to: toDateStr },
        newSlots
      );
      await fetchAvailability();
      Alert.alert(
        'Thành công',
        `Đã lưu và cập nhật lịch rảnh cho ${weekLabel}. Các ca đã có người đặt vẫn được bảo toàn.`
      );
    } catch (err) {
      Alert.alert(
        'Lỗi lưu lịch',
        err instanceof Error
          ? err.message
          : 'Không thể lưu lịch rảnh lên máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setSaving(false);
    }
  };

  const timezone = user?.profile?.timezone || 'Asia/Ho_Chi_Minh';

  return (
    <SchedulePresentation
      daysOfWeek={daysOfWeek}
      selectedDayIndex={selectedDayIndex}
      onSelectDay={setSelectedDayIndex}
      weekLabel={weekLabel}
      onPrevWeek={() => setCurrentWeekOffset((prev) => prev - 1)}
      onNextWeek={() => setCurrentWeekOffset((prev) => prev + 1)}
      slots={slots}
      loading={loading}
      saving={saving}
      error={error}
      timezone={timezone}
      onRefresh={fetchAvailability}
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }}
      onSaveSchedule={handleSaveSchedule}
    />
  );
}
