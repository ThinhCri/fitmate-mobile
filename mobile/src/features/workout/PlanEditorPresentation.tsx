import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
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
import {
  WorkoutPlanViewModel,
  ExerciseItemViewModel,
  ExerciseCatalogItemViewModel,
} from './workoutTypes';
import { InputField } from '@/components/design-system/Inputs';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { estimateExerciseKcal, estimatePlanKcal } from './calorieEstimate';
import { isValidRestSeconds, MAX_REST_SECONDS } from './sessionTiming';

export interface PlanEditorPresentationProps {
  initialPlan?: Partial<WorkoutPlanViewModel>;
  onBack: () => void;
  onSave: (plan: Partial<WorkoutPlanViewModel>) => void;
  isSaving?: boolean;
  catalog: ExerciseCatalogItemViewModel[];
  catalogLoading?: boolean;
  weightKg?: number;
}

export const PlanEditorPresentation: React.FC<PlanEditorPresentationProps> = ({
  initialPlan,
  onBack,
  onSave,
  isSaving = false,
  catalog,
  catalogLoading = false,
  weightKg = 0,
}) => {
  const [title, setTitle] = useState(initialPlan?.title ?? '');
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  const weekDays = [
    { label: 'T2', value: 'Mon' }, { label: 'T3', value: 'Tue' },
    { label: 'T4', value: 'Wed' }, { label: 'T5', value: 'Thu' },
    { label: 'T6', value: 'Fri' }, { label: 'T7', value: 'Sat' },
    { label: 'CN', value: 'Sun' },
  ];
  const [category, setCategory] = useState(initialPlan?.category ?? weekDays[currentDayIndex].value);
  const [durationMinutes, setDurationMinutes] = useState(
    initialPlan?.durationMinutes ? String(initialPlan.durationMinutes) : '45'
  );
  const [exercises, setExercises] = useState<ExerciseItemViewModel[]>(
    initialPlan?.exercises ?? []
  );
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [restDrafts, setRestDrafts] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddExercise = () => {
    setCatalogOpen((value) => !value);
  };

  const addFromCatalog = (item: ExerciseCatalogItemViewModel) => {
    const newExercise: ExerciseItemViewModel = {
      id: `catalog-${item.id}-${Date.now()}`,
      catalogId: item.id,
      name: item.nameVi,
      type: item.type,
      sets: 3,
      repsPerSet: item.type === 'reps' ? 10 : undefined,
      durationSeconds: item.type === 'time' ? 30 : undefined,
      restSeconds: 45,
      caloriesEstimate: estimateExerciseKcal({
        type: item.type, sets: 3, repsPerSet: 10, durationSeconds: 30,
      }, weightKg),
      instructions: item.instructionsVi.join(' '),
      targetMuscle: item.primaryMuscles[0],
      difficulty: item.difficulty,
      equipment: item.equipment,
      imageStartUrl: item.imageStartUrl,
      imageEndUrl: item.imageEndUrl,
      mediaSource: `${item.source} (${item.sourceLicense})`,
    };
    setExercises((current) => [...current, newExercise]);
    setCatalogOpen(false);
    setCatalogQuery('');
  };

  const visibleCatalog = catalog.filter((item) => {
    const query = catalogQuery.trim().toLocaleLowerCase('vi');
    return !query || item.nameVi.toLocaleLowerCase('vi').includes(query) ||
      item.nameEn.toLocaleLowerCase('en').includes(query);
  });

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
    for (const exercise of exercises) {
      if (!isValidRestSeconds(exercise.restSeconds)) {
        errs[`rest-${exercise.id}`] = `Nhập từ 0 đến ${MAX_REST_SECONDS} giây`;
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSave({
      title: title.trim(),
      category,
      description: `${exercises.length} bài tập`,
      durationMinutes: Number(durationMinutes) || 45,
      caloriesEstimate: estimatePlanKcal(exercises, weightKg),
      exercises: exercises.map((exercise) => ({
        ...exercise,
        caloriesEstimate: estimateExerciseKcal(exercise, weightKg),
      })),
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
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

          <View style={styles.dayPickerSection}>
            <Text style={styles.fieldLabel}>Ngày tập *</Text>
            <View style={styles.dayPickerRow}>
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => setCategory(day.value)}
                  style={[styles.dayPickerItem, category === day.value && styles.dayPickerItemActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: category === day.value }}
                  accessibilityLabel={`Chọn ngày ${day.label}`}
                >
                  <Text style={[styles.dayPickerText, category === day.value && styles.dayPickerTextActive]}>{day.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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

          {catalogOpen ? (
            <Card padding="md" style={styles.catalogCard}>
              <InputField
                label="Tìm trong thư viện"
                placeholder="Ví dụ: squat, plank, ngực..."
                value={catalogQuery}
                onChangeText={setCatalogQuery}
              />
              {catalogLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : visibleCatalog.length === 0 ? (
                <Text style={[typography.body, styles.catalogEmpty]}>
                  Không tìm thấy bài tập phù hợp.
                </Text>
              ) : (
                visibleCatalog.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.catalogItem}
                    onPress={() => addFromCatalog(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Thêm ${item.nameVi}`}
                  >
                    {item.imageStartUrl ? (
                      <Image
                        source={{ uri: item.imageStartUrl }}
                        style={styles.catalogThumbnail}
                        resizeMode="cover"
                        accessibilityRole="image"
                        accessibilityLabel={`Tư thế bắt đầu của ${item.nameVi}`}
                      />
                    ) : (
                      <View style={styles.catalogThumbnailFallback}>
                        <Dumbbell size={20} color={colors.primaryDark} />
                      </View>
                    )}
                    <View style={styles.catalogItemText}>
                      <Text style={[typography.bodyBold, styles.catalogName]}>
                        {item.nameVi}
                      </Text>
                      <Text style={[typography.caption, styles.catalogMeta]}>
                        {item.nameEn} • {item.equipment || 'Không dụng cụ'} • {item.difficulty}
                      </Text>
                    </View>
                    <Plus size={18} color={colors.primary} />
                  </TouchableOpacity>
                ))
              )}
            </Card>
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

              {ex.imageStartUrl || ex.imageEndUrl ? (
                <View style={styles.exerciseMediaRow}>
                  {ex.imageStartUrl ? (
                    <View style={styles.exerciseMediaItem}>
                      <Image source={{ uri: ex.imageStartUrl }} style={styles.exerciseMediaImage} resizeMode="cover" accessibilityRole="image" accessibilityLabel={`Tư thế bắt đầu của ${ex.name}`} />
                      <Text style={styles.exerciseMediaLabel}>Bắt đầu</Text>
                    </View>
                  ) : null}
                  {ex.imageEndUrl ? (
                    <View style={styles.exerciseMediaItem}>
                      <Image source={{ uri: ex.imageEndUrl }} style={styles.exerciseMediaImage} resizeMode="cover" accessibilityRole="image" accessibilityLabel={`Tư thế kết thúc của ${ex.name}`} />
                      <Text style={styles.exerciseMediaLabel}>Kết thúc</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

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
                    value={restDrafts[ex.id] ?? String(ex.restSeconds)}
                    maxLength={4}
                    error={errors[`rest-${ex.id}`]}
                    onChangeText={(text) => {
                      const digits = text.replace(/[^0-9]/g, '');
                      setRestDrafts(current => ({ ...current, [ex.id]: digits }));
                      handleUpdateExercise(ex.id, { restSeconds: digits === '' ? NaN : Number(digits) });
                    }}
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
  dayPickerSection: { gap: spacing.sm },
  fieldLabel: { ...typography.captionMedium, color: colors.textSecondary },
  dayPickerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  dayPickerItem: { flex: 1, minHeight: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.borderSubtle },
  dayPickerItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayPickerText: { ...typography.captionMedium, color: colors.textSecondary },
  dayPickerTextActive: { color: colors.white },
  exercisesSection: {
    gap: spacing.sm,
  },
  catalogCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  catalogEmpty: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  catalogItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  catalogThumbnail: { width: 60, height: 60, borderRadius: radius.md, backgroundColor: colors.surfaceSubtle },
  catalogThumbnailFallback: { width: 60, height: 60, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  catalogItemText: { flex: 1, gap: 2 },
  catalogName: { color: colors.textPrimary },
  catalogMeta: { color: colors.textSecondary },
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
  exerciseMediaRow: { flexDirection: 'row', gap: spacing.sm },
  exerciseMediaItem: { flex: 1, gap: spacing.xs },
  exerciseMediaImage: { width: '100%', aspectRatio: 1.5, borderRadius: radius.md, backgroundColor: colors.surfaceSubtle },
  exerciseMediaLabel: { ...typography.captionMedium, color: colors.textSecondary, textAlign: 'center' },
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
