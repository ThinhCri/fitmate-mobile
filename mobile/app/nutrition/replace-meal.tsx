import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import {
  ReplaceMealPresentation,
  ReplacementOption,
} from '@/features/nutrition/ReplaceMealPresentation';
import { PlannedMealSlotViewModel } from '@/features/nutrition/nutritionTypes';

const SUGGESTIONS: ReplacementOption[] = [
  {
    id: 's1',
    name: 'Bún bò Huế thanh vị (nạc)',
    portion: '1 tô vừa (300g)',
    calories: 480,
    protein: 32,
    carbs: 58,
    fat: 12,
  },
  {
    id: 's2',
    name: 'Salad cá ngừ ngô ngọt',
    portion: '1 đĩa lớn (250g)',
    calories: 360,
    protein: 34,
    carbs: 22,
    fat: 14,
  },
  {
    id: 's3',
    name: 'Cơm gạo lứt thịt bò xào ớt chuông',
    portion: '1 phần (280g)',
    calories: 520,
    protein: 38,
    carbs: 60,
    fat: 13,
  },
];

export default function ReplaceMealRoute() {
  const params = useLocalSearchParams<{ id?: string; name?: string; calories?: string }>();
  const [saving, setSaving] = useState(false);

  const currentMeal: PlannedMealSlotViewModel = {
    id: params.id ?? 'm1',
    dayIndex: 0,
    dayLabel: 'T2',
    mealSlot: 'lunch',
    foodName: params.name ?? 'Cơm gà xào nấm',
    calories: params.calories ? Number(params.calories) : 550,
    isCompleted: false,
  };

  const handleConfirm = (chosen: ReplacementOption) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 300);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <ReplaceMealPresentation
        currentMeal={currentMeal}
        suggestions={SUGGESTIONS}
        onBack={() => router.back()}
        onConfirmReplacement={handleConfirm}
        isSaving={saving}
      />
    </ScreenContainer>
  );
}
