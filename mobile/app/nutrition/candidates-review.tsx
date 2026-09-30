import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CandidateReviewPresentation } from '@/features/nutrition/CandidateReviewPresentation';
import { FoodCandidateViewModel, MealTimeSlot } from '@/features/nutrition/nutritionTypes';

const INITIAL_CANDIDATES: FoodCandidateViewModel[] = [
  {
    id: 'c1',
    name: 'Ức gà nướng mật ong',
    portionDescription: '1 khẩu phần tiêu chuẩn (150g)',
    calories: 247,
    protein: 36,
    carbs: 8,
    fat: 5,
    selected: true,
  },
  {
    id: 'c2',
    name: 'Cơm gạo lứt hấp',
    portionDescription: '1 chén vừa (120g)',
    calories: 134,
    protein: 3,
    carbs: 28,
    fat: 1,
    selected: true,
  },
  {
    id: 'c3',
    name: 'Bông cải xanh luộc',
    portionDescription: '1 phần (150g)',
    calories: 52,
    protein: 4,
    carbs: 9,
    fat: 0,
    selected: true,
  },
];

export default function CandidateReviewRoute() {
  const [candidates, setCandidates] = useState<FoodCandidateViewModel[]>(INITIAL_CANDIDATES);
  const [mealSlot, setMealSlot] = useState<MealTimeSlot>('lunch');
  const [saving, setSaving] = useState(false);

  const handleToggle = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleConfirmAndSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // Return to diary
      router.replace('/(tabs)/nutrition' as any);
    }, 400);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <CandidateReviewPresentation
        candidates={candidates}
        mealSlot={mealSlot}
        onMealSlotChange={setMealSlot}
        onToggleCandidate={handleToggle}
        onEditCandidate={() => {}}
        onAddManualMissing={() => router.push('/nutrition/manual-entry' as any)}
        onConfirmAndSave={handleConfirmAndSave}
        onBack={() => router.back()}
        isSaving={saving}
      />
    </ScreenContainer>
  );
}
