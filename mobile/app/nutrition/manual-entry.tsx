import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { ManualMealEntryPresentation, ManualMealEntryFormValues } from '@/features/nutrition/ManualMealEntryPresentation';
import { MealTimeSlot } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function ManualMealEntryRoute() {
  const params = useLocalSearchParams<{ slot?: string; name?: string; calories?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const submit = async (values: ManualMealEntryFormValues) => { setSubmitting(true); try { await getNutritionRepository().addFoodItem({ name: values.name, portion: `${values.quantity || '1'} ${values.unit || 'khẩu phần'}`, grams: Number(values.grams) || undefined, calories: Number(values.calories) || 0, proteinGrams: Number(values.protein) || 0, carbsGrams: Number(values.carbs) || 0, fatGrams: Number(values.fat) || 0, source: 'manual', mealSlot: values.mealSlot, loggedAt: new Date().toISOString(), notes: values.notes }); router.replace('/(tabs)/nutrition' as never); } catch (e) { Alert.alert('Không thể lưu món ăn', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSubmitting(false); } };
  return <ScreenContainer edges={['top', 'bottom']}><ManualMealEntryPresentation initialValues={{ mealSlot: (params.slot as MealTimeSlot) || 'breakfast', name: params.name, calories: params.calories ? Number(params.calories) : undefined }} onBack={() => router.back()} onSubmit={submit} isSubmitting={submitting} /></ScreenContainer>;
}
