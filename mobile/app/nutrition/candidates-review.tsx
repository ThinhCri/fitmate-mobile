import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CandidateReviewPresentation } from '@/features/nutrition/CandidateReviewPresentation';
import { FoodCandidateViewModel, MealTimeSlot } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function CandidateReviewRoute() {
  const { candidates: encoded } = useLocalSearchParams<{ candidates?: string }>();
  const initial = useMemo<FoodCandidateViewModel[]>(() => {
    try {
      const value = JSON.parse(encoded || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }, [encoded]);
  const [candidates, setCandidates] = useState(initial);
  const [mealSlot, setMealSlot] = useState<MealTimeSlot>('lunch');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCandidates(initial);
  }, [initial]);

  const save = async () => {
    const selected = candidates.filter((item) => item.selected);
    if (!selected.length) {
      Alert.alert('Chưa chọn kết quả', 'Hãy chọn ít nhất một kết quả để lưu.');
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        selected.map((item) => {
          const ingredientSummary = item.ingredients?.length
            ? item.ingredients
                .map((ingredient) =>
                  ingredient.portionGrams > 0
                    ? `${ingredient.name} ${ingredient.portionGrams}g`
                    : ingredient.name
                )
                .join(', ')
            : undefined;

          return getNutritionRepository().addFoodItem({
            name: item.name,
            portion: item.portionDescription,
            calories: item.calories,
            proteinGrams: item.protein,
            carbsGrams: item.carbs,
            fatGrams: item.fat,
            source: 'ai_confirmed',
            mealSlot,
            loggedAt: new Date().toISOString(),
            notes: ingredientSummary ? `Thành phần ước tính: ${ingredientSummary}` : undefined,
          });
        })
      );
      router.replace('/(tabs)/nutrition' as never);
    } catch (e) {
      Alert.alert('Không thể lưu kết quả', e instanceof Error ? e.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <CandidateReviewPresentation
        candidates={candidates}
        mealSlot={mealSlot}
        onMealSlotChange={setMealSlot}
        onToggleCandidate={(id) =>
          setCandidates((items) =>
            items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
          )
        }
        onEditCandidate={(candidate) =>
          router.push({
            pathname: '/nutrition/manual-entry' as never,
            params: { name: candidate.name, calories: String(candidate.calories), slot: mealSlot },
          })
        }
        onAddManualMissing={() => router.push('/nutrition/manual-entry' as never)}
        onConfirmAndSave={() => void save()}
        onBack={() => router.back()}
        isSaving={saving}
      />
    </ScreenContainer>
  );
}