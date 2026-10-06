import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { ManualMealEntryPresentation, ManualMealEntryFormValues } from '@/features/nutrition/ManualMealEntryPresentation';
import { MealTimeSlot } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';
import { setPendingCandidateChange } from '@/features/nutrition/nutritionScanSession';

export default function ManualMealEntryRoute() {
  const params = useLocalSearchParams<{ id?: string; mode?: string; candidateId?: string; planId?: string; weekStart?: string; dayIndex?: string; slot?: string; name?: string; portion?: string; grams?: string; calories?: string; protein?: string; carbs?: string; fat?: string; notes?: string; source?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const submit = async (values: ManualMealEntryFormValues) => {
    setSubmitting(true);
    try {
      const portion = `${values.quantity || '1'} ${values.unit || 'khẩu phần'}`;
      if (params.mode === 'scan-review') {
        const candidate = {
          id: params.candidateId || `manual-${Date.now()}`,
          name: values.name,
          portionDescription: portion,
          calories: Number(values.calories) || 0,
          protein: Number(values.protein) || 0,
          carbs: Number(values.carbs) || 0,
          fat: Number(values.fat) || 0,
          grams: Number(values.grams) || undefined,
          notes: values.notes?.trim() || undefined,
          selected: true,
        };
        setPendingCandidateChange({
          type: params.candidateId ? 'update' : 'add',
          candidate,
        });
        router.back();
      } else if (params.mode === 'plan') {
        const dayIndex = Number(params.dayIndex ?? 0);
        const plannedItem = {
          dayIndex,
          dayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][dayIndex] || '',
          mealSlot: values.mealSlot,
          foodName: values.name,
          portion,
          grams: Number(values.grams) || undefined,
          calories: Number(values.calories) || 0,
          proteinGrams: Number(values.protein) || 0,
          carbsGrams: Number(values.carbs) || 0,
          fatGrams: Number(values.fat) || 0,
          notes: values.notes,
        };
        if (!params.weekStart) throw new Error('Thiếu tuần cần cập nhật.');
        if (params.planId) await getNutritionRepository().updatePlannedMeal(params.planId, plannedItem, params.weekStart);
        else await getNutritionRepository().addPlannedMeal(plannedItem, params.weekStart);
        router.replace('/nutrition/weekly-menu' as never);
      } else {
        const item = { name: values.name, portion, grams: Number(values.grams) || undefined, calories: Number(values.calories) || 0, proteinGrams: Number(values.protein) || 0, carbsGrams: Number(values.carbs) || 0, fatGrams: Number(values.fat) || 0, source: params.source === 'ai_confirmed' ? 'ai_confirmed' as const : 'manual' as const, mealSlot: values.mealSlot, loggedAt: new Date().toISOString(), notes: values.notes, confirmed: true };
        if (params.id) await getNutritionRepository().updateFoodItem(params.id, item);
        else await getNutritionRepository().addFoodItem(item);
        router.replace('/(tabs)/nutrition' as never);
      }
    } catch (e) {
      Alert.alert('Không thể lưu món ăn', e instanceof Error ? e.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  const portionParts = params.portion?.match(/^\s*([\d.,]+)\s*(.*)$/);
  const isScanReview = params.mode === 'scan-review';
  return <ScreenContainer edges={['top', 'bottom']}><ManualMealEntryPresentation isEditing={Boolean(params.id || params.planId || params.candidateId)} initialValues={{ mealSlot: (params.slot as MealTimeSlot) || 'breakfast', name: params.name, portion: params.portion, grams: params.grams ? Number(params.grams) : undefined, calories: params.calories ? Number(params.calories) : undefined, proteinGrams: params.protein ? Number(params.protein) : undefined, carbsGrams: params.carbs ? Number(params.carbs) : undefined, fatGrams: params.fat ? Number(params.fat) : undefined, notes: params.notes }} initialQuantity={portionParts?.[1]} initialUnit={portionParts?.[2]} onBack={() => router.back()} onSubmit={submit} isSubmitting={submitting} submitLabel={isScanReview ? (params.candidateId ? 'Cập nhật trong bữa ăn' : 'Thêm vào bữa ăn') : undefined} /></ScreenContainer>;
}
