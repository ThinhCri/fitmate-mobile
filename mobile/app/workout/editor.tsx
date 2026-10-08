import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { PlanEditorPresentation } from '@/features/workout/PlanEditorPresentation';
import {
  ExerciseCatalogItemViewModel,
  WorkoutPlanViewModel,
} from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';

const EMPTY_PLAN: Partial<WorkoutPlanViewModel> = {
  title: '',
  category: 'Mon',
  description: '',
  durationMinutes: 45,
  caloriesEstimate: 0,
  isActive: true,
  exercises: [],
};

export default function PlanEditorScreen() {
  const router = useRouter();
  const { id, day } = useLocalSearchParams<{ id?: string; day?: string }>();
  const [plan, setPlan] = useState<Partial<WorkoutPlanViewModel> | null>(
    id ? null : { ...EMPTY_PLAN, category: day || EMPTY_PLAN.category }
  );
  const [catalog, setCatalog] = useState<ExerciseCatalogItemViewModel[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weightKg, setWeightKg] = useState(0);

  useEffect(() => {
    getWorkoutRepository().getWeightRecords()
      .then(({ currentWeightKg }) => setWeightKg(currentWeightKg))
      .catch(() => setWeightKg(0));
  }, []);

  useEffect(() => {
    let active = true;
    getWorkoutRepository().listExerciseCatalog()
      .then((items) => {
        if (active) setCatalog(items);
      })
      .catch((reason) => {
        if (active) {
          Alert.alert(
            'Không thể tải thư viện bài tập',
            reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
          );
        }
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    getWorkoutRepository().getPlan(id)
      .then(setPlan)
      .catch((reason) => Alert.alert(
        'Không thể tải kế hoạch',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.',
        [{ text: 'Quay lại', onPress: () => router.back() }]
      ));
  }, [id, router]);

  const save = async (value: Partial<WorkoutPlanViewModel>) => {
    setSaving(true);
    try {
      if (id) {
        await getWorkoutRepository().updatePlan(id, value);
        router.replace(`/workout/${id}` as never);
      } else {
        const createdId = await getWorkoutRepository().createPlan(value);
        router.replace(`/workout/${createdId}` as never);
      }
    } catch (reason) {
      Alert.alert(
        'Không thể lưu kế hoạch',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {plan ? (
        <PlanEditorPresentation
          initialPlan={plan}
          catalog={catalog}
          catalogLoading={catalogLoading}
          weightKg={weightKg}
          onSave={(value) => void save(value)}
          onBack={() => router.back()}
          isSaving={saving}
        />
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center' },
});
