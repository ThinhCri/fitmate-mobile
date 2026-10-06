import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CandidateReviewPresentation } from '@/features/nutrition/CandidateReviewPresentation';
import { FoodCandidateViewModel, MealTimeSlot } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';
import * as FileSystem from 'expo-file-system/legacy';
import { clearCurrentScanImageUri, clearPendingCandidateChange, getCurrentScanImageUri, takePendingCandidateChange } from '@/features/nutrition/nutritionScanSession';

export default function CandidateReviewRoute() {
  const { candidates: encoded, ingredients: encodedIngredients, imageUri: imageUriParam } = useLocalSearchParams<{ candidates?: string; ingredients?: string; imageUri?: string | string[] }>();
  const imageUri = getCurrentScanImageUri() || (Array.isArray(imageUriParam) ? imageUriParam[0] : imageUriParam);
  const initial = useMemo<FoodCandidateViewModel[]>(() => { try { const value = JSON.parse(encoded || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }, [encoded]);
  const ingredients = useMemo<string[]>(() => { try { const value = JSON.parse(encodedIngredients || '[]'); return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; } catch { return []; } }, [encodedIngredients]);
  const [candidates, setCandidates] = useState(initial);
  const [mealSlot, setMealSlot] = useState<MealTimeSlot>('lunch');
  const [saving, setSaving] = useState(false);
  useFocusEffect(useCallback(() => {
    const change = takePendingCandidateChange();
    if (!change) return;
    setCandidates((items) => change.type === 'update'
      ? items.map((item) => item.id === change.candidate.id ? change.candidate : item)
      : [...items, change.candidate]);
  }, []));
  const cleanupReviewImage = async () => {
    if (imageUri?.startsWith(FileSystem.cacheDirectory || '__no_cache__')) {
      await FileSystem.deleteAsync(imageUri, { idempotent: true }).catch(() => undefined);
    }
    clearCurrentScanImageUri();
    clearPendingCandidateChange();
  };
  const save = async () => { const selected = candidates.filter((item) => item.selected); if (!selected.length) { Alert.alert('Chưa chọn món', 'Hãy chọn ít nhất một món để lưu.'); return; } setSaving(true); try { await Promise.all(selected.map((item) => getNutritionRepository().addFoodItem({ name: item.name, portion: /^\s*\d/.test(item.portionDescription) ? item.portionDescription : '1 khẩu phần', grams: item.grams, calories: item.calories, proteinGrams: item.protein, carbsGrams: item.carbs, fatGrams: item.fat, source: 'ai_confirmed', mealSlot, loggedAt: new Date().toISOString(), notes: item.notes, aiConfidence: item.confidenceScore, confirmed: true }))); await cleanupReviewImage(); router.replace('/(tabs)/nutrition' as never); } catch (e) { Alert.alert('Không thể lưu kết quả', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSaving(false); } };
  return <ScreenContainer edges={['top', 'bottom']}><CandidateReviewPresentation imageUri={imageUri} ingredients={ingredients} candidates={candidates} mealSlot={mealSlot} onMealSlotChange={setMealSlot} onToggleCandidate={(id) => setCandidates((items) => items.map((item) => item.id === id ? { ...item, selected: !item.selected } : item))} onEditCandidate={(candidate) => router.push({ pathname: '/nutrition/manual-entry' as never, params: { mode: 'scan-review', candidateId: candidate.id, name: candidate.name, portion: candidate.portionDescription, grams: candidate.grams ? String(candidate.grams) : undefined, calories: String(candidate.calories), protein: String(candidate.protein), carbs: String(candidate.carbs), fat: String(candidate.fat), notes: candidate.notes, slot: mealSlot, source: 'ai_confirmed' } })} onAddManualMissing={() => router.push({ pathname: '/nutrition/manual-entry' as never, params: { mode: 'scan-review', slot: mealSlot } })} onConfirmAndSave={() => void save()} onBack={() => void cleanupReviewImage().finally(() => router.back())} isSaving={saving} /></ScreenContainer>;
}
