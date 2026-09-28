import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

  // Generate days of the week based on current week offset
  const { daysOfWeek, weekLabel, fromDate, toDate } = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday + currentWeekOffset * 7);

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

    const fromDateStr = days[0].dateStr;
    const toDateStr = days[6].dateStr;

    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const label = `Tuần (${pad(monday.getDate())}/${pad(monday.getMonth() + 1)} - ${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}/${sunday.getFullYear()})`;

    return {
      daysOfWeek: days,
      weekLabel: label,
      fromDate: fromDateStr,
      toDate: toDateStr,
    };
  }, [currentWeekOffset]);

  const fetchAvailability = useCallback(async () => {
    const trainerId = user?.profile?.phone || '00000000-0000-0000-0000-000000000000';
    setLoading(true);
    try {
      const result = await ptService.getMyAvailability(trainerId, {
        from: fromDate,
        to: toDate,
      });
      setSlots(result || []);
    } catch {
      // If fetching fails or no existing slots, keep slots empty without throwing unhandled rejection
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [user, fromDate, toDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleSaveSchedule = async (newSlots: AvailabilitySlotInput[]) => {
    setSaving(true);
    try {
      await ptService.setMyAvailability(newSlots);
      await fetchAvailability();
    } finally {
      setSaving(false);
    }
  };

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
