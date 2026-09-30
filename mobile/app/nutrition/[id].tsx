import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { MealDetailPresentation } from '@/features/nutrition/MealDetailPresentation';
import { FoodItemViewModel } from '@/features/nutrition/nutritionTypes';

export default function MealDetailRoute() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const [deleting, setDeleting] = useState(false);

  const sampleFood: FoodItemViewModel = {
    id: params.id ?? 'item-1',
    name: params.name ?? 'Ức gà nướng mật ong',
    portion: '1 khẩu phần (150g)',
    calories: 247,
    proteinGrams: 36,
    carbsGrams: 8,
    fatGrams: 5,
    source: 'ai_confirmed',
    mealSlot: 'lunch',
    notes: 'Ướp sốt mật ong mù tạt, nướng nồi chiên không dầu',
  };

  const handleEdit = () => {
    router.push({
      pathname: '/nutrition/manual-entry' as any,
      params: { id: sampleFood.id, name: sampleFood.name, slot: sampleFood.mealSlot },
    });
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      router.back();
    }, 300);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <MealDetailPresentation
        food={sampleFood}
        onBack={() => router.back()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleting}
      />
    </ScreenContainer>
  );
}
