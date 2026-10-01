import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { WeeklyMenuPresentation } from '@/features/nutrition/WeeklyMenuPresentation';
import { PlannedMealSlotViewModel, MealTimeSlot } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function WeeklyMenuRoute() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [slots, setSlots] = useState<PlannedMealSlotViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNutritionRepository()
      .getWeeklyMenu()
      .then((data) => {
        setSlots(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải thực đơn tuần');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleMarkConsumed = async (slot: PlannedMealSlotViewModel) => {
    const nextCompleted = !slot.isCompleted;
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, isCompleted: nextCompleted } : s))
    );
    try {
      await getNutritionRepository().updatePlannedSlot(slot.id, nextCompleted);
    } catch {
      // Revert if error
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, isCompleted: !nextCompleted } : s))
      );
    }
  };

  const handleReplaceMeal = (slot: PlannedMealSlotViewModel) => {
    router.push({
      pathname: '/nutrition/replace-meal' as any,
      params: { id: slot.id, name: slot.foodName, calories: slot.calories },
    });
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </ScreenContainer>
    );
  }

  if (error && slots.length === 0) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <WeeklyMenuPresentation
        onBack={() => router.back()}
        selectedDayIndex={selectedDay}
        onSelectDay={setSelectedDay}
        menuSlots={slots}
        onMarkConsumed={handleMarkConsumed}
        onReplaceMeal={handleReplaceMeal}
        onAddMealSlot={(slot: MealTimeSlot) => {
          router.push({
            pathname: '/nutrition/manual-entry' as any,
            params: { slot },
          });
        }}
      />
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
