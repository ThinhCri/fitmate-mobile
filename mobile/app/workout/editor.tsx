import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlanEditorPresentation } from '@/features/workout/PlanEditorPresentation';
import { WorkoutPlanViewModel } from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';

const EMPTY_PLAN: Partial<WorkoutPlanViewModel> = { title: '', category: 'Toàn thân', description: '', durationMinutes: 45, caloriesEstimate: 0, isActive: true, exercises: [] };
export default function PlanEditorScreen() {
  const router = useRouter(); const { id } = useLocalSearchParams<{ id?: string }>(); const [plan, setPlan] = useState<Partial<WorkoutPlanViewModel> | null>(id ? null : EMPTY_PLAN); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!id) return; getWorkoutRepository().getPlan(id).then(setPlan).catch((e) => Alert.alert('Không thể tải giáo án', e instanceof Error ? e.message : 'Vui lòng thử lại.', [{ text: 'Quay lại', onPress: () => router.back() }])); }, [id, router]);
  const save = async (value: Partial<WorkoutPlanViewModel>) => { setSaving(true); try { if (id) { await getWorkoutRepository().updatePlan(id, value); router.replace(`/workout/${id}` as never); } else { const createdId = await getWorkoutRepository().createPlan(value); router.replace(`/workout/${createdId}` as never); } } catch (e) { Alert.alert('Không thể lưu giáo án', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSaving(false); } };
  return <View style={styles.container}>{plan ? <PlanEditorPresentation initialPlan={plan} onSave={(value) => void save(value)} onBack={() => router.back()} isSaving={saving} /> : <ActivityIndicator />}</View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center' } });
