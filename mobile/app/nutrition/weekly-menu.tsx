import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { WeeklyMenuPresentation } from '@/features/nutrition/WeeklyMenuPresentation';
import { PlannedMealSlotViewModel, MealTimeSlot } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function WeeklyMenuRoute() {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIndex);
  const weekStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [slots, setSlots] = useState<PlannedMealSlotViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    getNutritionRepository().getWeeklyMenu(weekStart)
      .then((data) => {
        if (!active) return;
        setSlots(data);
        setError(null);
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Không thể tải thực đơn tuần');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [weekStart]));

  const handleMarkConsumed = async (slot: PlannedMealSlotViewModel) => {
    if (slot.isCompleted) return;
    const target = new Date(monday);
    target.setDate(monday.getDate() + slot.dayIndex);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (target.getTime() > today.getTime()) {
      Alert.alert('Chưa đến ngày', 'Bạn chỉ có thể xác nhận món đã ăn trong hôm nay hoặc những ngày trước.');
      return;
    }
    const targetDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, isCompleted: true, consumedDate: targetDate } : s))
    );
    try {
      await getNutritionRepository().consumePlannedMeal(slot.id, targetDate);
    } catch {
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, isCompleted: false, consumedDate: undefined } : s))
      );
      Alert.alert('Không thể đánh dấu đã ăn', 'Vui lòng thử lại.');
    }
  };

  const handleReplaceMeal = (slot: PlannedMealSlotViewModel) => {
    router.push({
      pathname: '/nutrition/manual-entry' as any,
      params: {
        mode: 'plan', planId: slot.id, weekStart, dayIndex: String(slot.dayIndex),
        slot: slot.mealSlot, name: slot.foodName, portion: slot.portion,
        grams: slot.grams?.toString(), calories: slot.calories.toString(),
        protein: slot.proteinGrams.toString(), carbs: slot.carbsGrams.toString(),
        fat: slot.fatGrams.toString(), notes: slot.notes,
      },
    });
  };

  const handleDeleteMeal = (slot: PlannedMealSlotViewModel) => {
    Alert.alert('Xóa món khỏi kế hoạch?', 'Nhật ký những lần đã ăn trước đây vẫn được giữ lại.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await getNutritionRepository().deletePlannedMeal(slot.id);
            setSlots((prev) => prev.filter((entry) => entry.id !== slot.id));
          } catch {
            Alert.alert('Không thể xóa món', 'Vui lòng thử lại.');
          }
        },
      },
    ]);
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
        todayDayIndex={todayIndex}
        onSelectDay={setSelectedDay}
        menuSlots={slots}
        onMarkConsumed={handleMarkConsumed}
        onReplaceMeal={handleReplaceMeal}
        onDeleteMeal={handleDeleteMeal}
        onAddMealSlot={(slot: MealTimeSlot) => {
          router.push({
            pathname: '/nutrition/manual-entry' as any,
            params: { mode: 'plan', slot, dayIndex: String(selectedDay), weekStart },
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
