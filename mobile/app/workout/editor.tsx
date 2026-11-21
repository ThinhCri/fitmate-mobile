import { colors } from '@/theme/designTokens';
import { useAuth } from '@/services/AuthContext';
import { readAiPlan, clearAiPlan } from '@/features/workout/aiPlanDraft';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

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
  const { id, day, aiDraft } = useLocalSearchParams<{ id?: string; day?: string; aiDraft?: string }>();
  const { user } = useAuth();
  const [plan, setPlan] = useState<Partial<WorkoutPlanViewModel> | null>(
    id ? null : aiDraft ? readAiPlan(user?.id || "", aiDraft) : { ...EMPTY_PLAN, category: day || EMPTY_PLAN.category }
  );
  const [catalog, setCatalog] = useState<ExerciseCatalogItemViewModel[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
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
    if (savingRef.current) return;
    if (aiDraft && !readAiPlan(user?.id || "", aiDraft)) { Alert.alert("Gợi ý đã hết hiệu lực", "Hãy lấy lại gợi ý cho tài khoản đang đăng nhập."); return; }
    savingRef.current = true;
    setSaving(true);
    try {
      if (id) {
        await getWorkoutRepository().updatePlan(id, value);
        router.replace(`/workout/${id}` as never);
      } else {
        const createdId = await getWorkoutRepository().createPlan(value);
        if (aiDraft && user) clearAiPlan(user.id, aiDraft);
        router.replace(`/workout/${createdId}` as never);
      }
    } catch (reason) {
      Alert.alert(
        'Không thể lưu kế hoạch',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {plan && (!aiDraft || readAiPlan(user?.id || "", aiDraft)) ? (
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
        aiDraft ? <View style={{ padding: 24, gap: 16 }}><Text>Bản gợi ý không còn khả dụng. Hãy quay lại để lấy gợi ý mới.</Text><TouchableOpacity onPress={() => router.back()}><Text>Quay lại</Text></TouchableOpacity></View> : <ActivityIndicator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
});
