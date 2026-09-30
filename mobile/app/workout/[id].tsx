import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlanDetailPresentation } from '../../src/features/workout/PlanDetailPresentation';
import { WorkoutPlanViewModel } from '../../src/features/workout/workoutTypes';

const MOCK_PLAN: WorkoutPlanViewModel = {
  id: 'plan-1',
  title: 'Upper Body A — Sức mạnh',
  category: 'Sức mạnh • Thân trên',
  description: 'Tập trung kích thích nhóm cơ ngực, vai và tay sau với các bài compound chính.',
  durationMinutes: 45,
  caloriesEstimate: 320,
  isActive: true,
  coachName: 'HLV Tuấn Anh',
  coachVerified: true,
  coachNotes: 'Nghỉ đủ 90s giữa các hiệp tạ nặng. Chú ý khóa khớp cổ tay khi đẩy ngực.',
  exercises: [
    {
      id: 'ex-1',
      name: 'Đẩy ngực tạ đòn (Barbell Bench Press)',
      type: 'reps',
      sets: 4,
      repsPerSet: 10,
      restSeconds: 90,
      caloriesEstimate: 80,
      targetMuscle: 'Ngực',
      instructions: 'Hạ thanh đòn chạm ngực dưới, đẩy dứt khoát không khóa khớp cùi chỏ quá mạnh.',
    },
    {
      id: 'ex-2',
      name: 'Đẩy tạ đơn dốc lên (Incline DB Press)',
      type: 'reps',
      sets: 3,
      repsPerSet: 12,
      restSeconds: 60,
      caloriesEstimate: 70,
      targetMuscle: 'Ngực trên',
    },
    {
      id: 'ex-3',
      name: 'Plank giữ thăng bằng',
      type: 'time',
      sets: 3,
      durationSeconds: 60,
      restSeconds: 45,
      caloriesEstimate: 40,
      targetMuscle: 'Core',
    },
  ],
};

export default function PlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan] = useState<WorkoutPlanViewModel>({
    ...MOCK_PLAN,
    id: id || MOCK_PLAN.id,
  });

  return (
    <View style={styles.container}>
      <PlanDetailPresentation
        plan={plan}
        onBack={() => router.back()}
        onStartSession={() => router.push('/workout/active-session' as any)}
        onEditPlan={() => router.push('/workout/editor' as any)}
        onDeletePlan={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
