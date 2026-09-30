import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  Timer,
  ChevronDown,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { WorkoutPlanViewModel, ExerciseItemViewModel } from './workoutTypes';
import { InputField } from '@/components/design-system/Inputs';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';

export interface PlanEditorPresentationProps {
  initialPlan?: Partial<WorkoutPlanViewModel>;
  onBack: () => void;
  onSave: (plan: Partial<WorkoutPlanViewModel>) => void;
  isSaving?: boolean;
}

export const PlanEditorPresentation: React.FC<PlanEditorPresentationProps> = ({
  initialPlan,
  onBack,
  onSave,
  isSaving = false,
}) => {
  const [title, setTitle] = useState(initialPlan?.title ?? '');
  const [category, setCategory] = useState(initialPlan?.category ?? 'Sức mạnh • Thân trên');
  const [description, setDescription] = useState(initialPlan?.description ?? '');
  const [durationMinutes, setDurationMinutes] = useState(
    initialPlan?.durationMinutes ? String(initialPlan.durationMinutes) : '45'
  );
  const [exercises, setExercises] = useState<ExerciseItemViewModel[]>(
    initialPlan?.exercises ?? [
      {
        id: 'ex-1',
        name: 'Hít đất (Push-up)',
        type: 'reps',
        sets: 3,
        repsPerSet: 12,
        restSeconds: 45,
        caloriesEstimate: 60,
      },
      {
        id: 'ex-2',
        name: 'Plank siết cơ bụng',
        type: 'time',
        sets: 3,
        durationSeconds: 45,
        restSeconds: 30,
        caloriesEstimate: 45,
      },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddExercise = () => {
    const newEx: ExerciseItemViewModel = {
      id: `ex-${Date.now()}`,
      name: 'Bài tập mới',
      type: 'reps',
      sets: 3,
      repsPerSet: 10,
      restSeconds: 60,
      caloriesEstimate: 50,
    };
    setExercises((prev) => [...prev, newEx]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateExercise = (id: string, patch: Partial<ExerciseItemViewModel>) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Vui lòng nhập tên kế hoạch';
    }
    if (exercises.length === 0) {
      errs.exercises = 'Kế hoạch phải có ít nhất 1 bài tập';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSave({
      title: title.trim(),
      category,
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 45,
      caloriesEstimate: exercises.reduce((acc, e) => acc + e.caloriesEstimate, 0),
      exercises,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.title3, styles.topBarTitle]}>
            {initialPlan?.id ? 'Chỉnh sửa kế hoạch' : 'Tạo kế hoạch tập'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* General Info Card */}
        <Card padding="md" style={styles.card}>
          <Text style={[typography.title3, styles.cardTitle]}>Thông tin kế hoạch</Text>

          <InputField
            label="Tên kế hoạch *"
            placeholder="Ví dụ: Thể lực & Sức mạnh thân trên..."
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />

          <InputField
            label="Phân loại / Mục tiêu"
            placeholder="Ví dụ: Tăng cơ, Giảm mỡ, Thể lực..."
            value={category}
            onChangeText={setCategory}
          />

          <InputField
            label="Mô tả tóm tắt"
            placeholder="Mô tả mục tiêu và nhóm cơ tác động chính..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <InputField
            label="Thời lượng ước tính (phút)"
            keyboardType="numeric"
            placeholder="45"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
          />
        </Card>

        {/* Exercises Builder Section */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[typography.title3, styles.sectionTitle]}>Danh sách bài tập</Text>
            <TouchableOpacity
              onPress={handleAddExercise}
              style={styles.addExerciseBtn}
              accessibilityRole="button"
              accessibilityLabel="Thêm bài tập"
            >
              <Plus size={16} color={colors.primary} />
              <Text style={[typography.bodyMedium, styles.addExerciseText]}>Thêm bài</Text>
            </TouchableOpacity>
          </View>

          {errors.exercises ? (
            <Text style={[typography.caption, { color: colors.danger }]}>{errors.exercises}</Text>
          ) : null}

          {exercises.map((ex, idx) => (
            <Card key={ex.id} padding="md" style={styles.exerciseEditorCard}>
              <View style={styles.exerciseHeaderRow}>
                <View style={styles.orderPill}>
                  <Text style={[typography.captionMedium, styles.orderText]}>Bài {idx + 1}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveExercise(ex.id)}
                  style={styles.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Xóa bài tập này"
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <InputField
                label="Tên động tác"
                value={ex.name}
                onChangeText={(t) => handleUpdateExercise(ex.id, { name: t })}
              />

              {/* Type and Reps/Time */}
              <View style={styles.typeRow}>
                <TouchableOpacity
                  onPress={() => handleUpdateExercise(ex.id, { type: 'reps' })}
                  style={[styles.typeBtn, ex.type === 'reps' && styles.typeBtnSelected]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      typography.captionMedium,
                      ex.type === 'reps' ? styles.typeTextSelected : styles.typeTextUnselected,
                    ]}
                  >
                    Tính theo lần (Reps)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUpdateExercise(ex.id, { type: 'time' })}
                  style={[styles.typeBtn, ex.type === 'time' && styles.typeBtnSelected]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      typography.captionMedium,
                      ex.type === 'time' ? styles.typeTextSelected : styles.typeTextUnselected,
                    ]}
                  >
                    Tính theo giây (Time)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sets & Reps/Duration inputs */}
              <View style={styles.metricsInputsRow}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Số hiệp"
                    keyboardType="numeric"
                    value={String(ex.sets)}
                    onChangeText={(t) => handleUpdateExercise(ex.id, { sets: Number(t) || 1 })}
                  />
                </View>

                {ex.type === 'reps' ? (
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Lần / hiệp"
                      keyboardType="numeric"
                      value={String(ex.repsPerSet ?? 10)}
                      onChangeText={(t) =>
                        handleUpdateExercise(ex.id, { repsPerSet: Number(t) || 1 })
                      }
                    />
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Giây / hiệp"
                      keyboardType="numeric"
                      value={String(ex.durationSeconds ?? 30)}
                      onChangeText={(t) =>
                        handleUpdateExercise(ex.id, { durationSeconds: Number(t) || 1 })
                      }
                    />
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <InputField
                    label="Nghỉ (giây)"
                    keyboardType="numeric"
                    value={String(ex.restSeconds)}
                    onChangeText={(t) =>
                      handleUpdateExercise(ex.id, { restSeconds: Number(t) || 30 })
                    }
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Submit */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            label="Lưu kế hoạch tập"
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: colors.textPrimary,
  },
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  exercisesSection: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  addExerciseText: {
    color: colors.primary,
  },
  exerciseEditorCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  orderText: {
    color: colors.textSecondary,
  },
  removeBtn: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typeBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  typeTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  typeTextUnselected: {
    color: colors.textSecondary,
  },
  metricsInputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ctaContainer: {
    marginTop: spacing.sm,
  },
});
