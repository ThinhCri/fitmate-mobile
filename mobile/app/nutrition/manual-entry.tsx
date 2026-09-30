import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import {
  ManualMealEntryPresentation,
  ManualMealEntryFormValues,
} from '@/features/nutrition/ManualMealEntryPresentation';
import { MealTimeSlot } from '@/features/nutrition/nutritionTypes';

export default function ManualMealEntryRoute() {
  const params = useLocalSearchParams<{ slot?: string; id?: string; name?: string; calories?: string }>();
  const [submitting, setSubmitting] = useState(false);

  const initialSlot = (params.slot as MealTimeSlot) || 'breakfast';

  const handleSubmit = (values: ManualMealEntryFormValues) => {
    setSubmitting(true);
    // In production, calls nutritionService.logMeal(...)
    // Here we perform safe client transition
    setTimeout(() => {
      setSubmitting(false);
      router.back();
    }, 300);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <ManualMealEntryPresentation
        initialValues={{
          mealSlot: initialSlot,
          name: params.name,
          calories: params.calories ? Number(params.calories) : undefined,
        }}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </ScreenContainer>
  );
}
