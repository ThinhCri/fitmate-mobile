import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { WeeklyMenuPresentation } from '@/features/nutrition/WeeklyMenuPresentation';
import { PlannedMealSlotViewModel, MealTimeSlot } from '@/features/nutrition/nutritionTypes';

const INITIAL_MENU: PlannedMealSlotViewModel[] = [
  {
    id: 'm1',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'breakfast',
    foodName: 'Cháo yến mạch sữa hạt & quả mọng',
    calories: 320,
    isCompleted: true,
  },
  {
    id: 'm2',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'lunch',
    foodName: 'Cơm gạo lứt + ức gà áp chảo + rau củ luộc',
    calories: 580,
    isCompleted: true,
  },
  {
    id: 'm3',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'dinner',
    foodName: 'Salad cá hồi áp chảo dầu ô liu',
    calories: 420,
    isCompleted: false,
  },
  {
    id: 'm4',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'snack',
    foodName: 'Sữa chua Hy Lạp + hạnh nhân',
    calories: 160,
    isCompleted: false,
  },
];

export default function WeeklyMenuRoute() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [slots, setSlots] = useState(INITIAL_MENU);

  const handleMarkConsumed = (slot: PlannedMealSlotViewModel) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handleReplaceMeal = (slot: PlannedMealSlotViewModel) => {
    router.push({
      pathname: '/nutrition/replace-meal' as any,
      params: { id: slot.id, name: slot.foodName, calories: slot.calories },
    });
  };

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
