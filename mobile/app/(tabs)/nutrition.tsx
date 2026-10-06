import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { NutritionDiaryPresentation } from '@/features/nutrition/NutritionDiaryPresentation';
import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  MealTimeSlot,
} from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function NutritionScreen() {
  const toDateString = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [summary, setSummary] = useState<DayNutritionSummaryViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<'diary' | 'menu'>('diary');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async (date = selectedDate) => {
    try {
      const data = await getNutritionRepository().getDaySummary(date);
      setSummary(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải nhật ký dinh dưỡng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    void fetchSummary();
  }, [fetchSummary]));

  const moveDay = (offset: number) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    const next = toDateString(date);
    setSelectedDate(next);
  };

  const handleDatePicked = (_event: DateTimePickerEvent, value?: Date) => {
    setShowDatePicker(false);
    if (value) setSelectedDate(toDateString(value));
  };

  const handleSegmentChange = (newSegment: 'diary' | 'menu') => {
    if (newSegment === 'menu') {
      router.push('/nutrition/weekly-menu' as any);
    } else {
      setSegment('diary');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top']}>
        <AppTopBar title="Nhật ký dinh dưỡng" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !summary) {
    return (
      <ScreenContainer edges={['top']}>
        <AppTopBar title="Nhật ký dinh dưỡng" />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Không có dữ liệu dinh dưỡng'}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Nhật ký dinh dưỡng" />

      <NutritionDiaryPresentation
        summary={summary}
        activeSegment={segment}
        onSegmentChange={handleSegmentChange}
        onPrevDay={() => moveDay(-1)}
        onNextDay={() => moveDay(1)}
        onSelectDate={() => setShowDatePicker(true)}
        onAddManualPress={(slot?: MealTimeSlot) => {
          router.push({
            pathname: '/nutrition/manual-entry' as any,
            params: slot ? { slot } : {},
          });
        }}
        onScanPress={() => router.push('/nutrition/scan' as any)}
        onGoalsPress={() => router.push('/nutrition/goals' as any)}
        onFoodItemPress={(item: FoodItemViewModel) => {
          router.push({
            pathname: '/nutrition/[id]' as any,
            params: { id: item.id, name: item.name },
          });
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      {showDatePicker ? (
        <DateTimePicker
          value={new Date(`${selectedDate}T12:00:00`)}
          mode="date"
          maximumDate={new Date()}
          onChange={handleDatePicked}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
  },
});
