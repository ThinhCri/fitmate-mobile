import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PlanEditorPresentation } from '../../src/features/workout/PlanEditorPresentation';
import { WorkoutPlanViewModel } from '../../src/features/workout/workoutTypes';

const INITIAL_PLAN: WorkoutPlanViewModel = {
  id: 'new-plan',
  title: 'Giáo án mới',
  category: 'Toàn thân',
  description: 'Giáo án tự thiết kế cho mục tiêu cá nhân.',
  durationMinutes: 40,
  caloriesEstimate: 280,
  isActive: true,
  exercises: [
    {
      id: 'ex-1',
      name: 'Hít đất (Push-up)',
      type: 'reps',
      sets: 3,
      repsPerSet: 15,
      restSeconds: 60,
      caloriesEstimate: 50,
      targetMuscle: 'Ngực & Tay sau',
    },
    {
      id: 'ex-2',
      name: 'Squat thể trọng',
      type: 'reps',
      sets: 4,
      repsPerSet: 20,
      restSeconds: 60,
      caloriesEstimate: 80,
      targetMuscle: 'Chân & Đùi',
    },
  ],
};

export default function PlanEditorScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PlanEditorPresentation
        initialPlan={INITIAL_PLAN}
        onSave={(_updated) => router.back()}
        onBack={() => router.back()}
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
