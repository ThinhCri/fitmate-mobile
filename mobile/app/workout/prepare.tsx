import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Dumbbell, ImageOff, RefreshCw } from 'lucide-react-native';

import { AppTopBar } from '@/components/design-system/AppTopBar';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { estimateExerciseKcal, estimatePlanKcal } from '@/features/workout/calorieEstimate';
import { bodyweightAlternatives, equipmentLabel, findCatalogMatch, isBodyweight } from '@/features/workout/workoutCatalog';
import type { ExerciseCatalogItemViewModel, ExerciseItemViewModel, WorkoutPlanViewModel } from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

function replacementFromCatalog(
  current: ExerciseItemViewModel,
  item: ExerciseCatalogItemViewModel,
  weightKg: number
): ExerciseItemViewModel {
  const replacement: ExerciseItemViewModel = {
    ...current,
    catalogId: item.id,
    name: item.nameVi,
    type: item.type,
    repsPerSet: item.type === 'reps' ? (current.repsPerSet ?? 10) : undefined,
    durationSeconds: item.type === 'time' ? (current.durationSeconds ?? 30) : undefined,
    instructions: item.instructionsVi.join(' '),
    targetMuscle: item.primaryMuscles[0],
    equipment: item.equipment,
    difficulty: item.difficulty,
    imageStartUrl: item.imageStartUrl,
    imageEndUrl: item.imageEndUrl,
    mediaSource: `${item.source} (${item.sourceLicense})`,
  };
  return { ...replacement, caloriesEstimate: estimateExerciseKcal(replacement, weightKg) };
}

export default function PrepareWorkoutScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const [plan, setPlan] = useState<WorkoutPlanViewModel | null>(null);
  const [catalog, setCatalog] = useState<ExerciseCatalogItemViewModel[]>([]);
  const [weightKg, setWeightKg] = useState(0);
  const [available, setAvailable] = useState<Record<string, boolean>>({});
  const [replacements, setReplacements] = useState<Record<number, ExerciseItemViewModel>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    if (!planId) {
      setError('Thiếu mã kế hoạch tập.');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setReplacements({});
    setAvailable({});
    const repository = getWorkoutRepository();
    Promise.all([
      repository.getPlan(planId),
      repository.listExerciseCatalog().catch(() => []),
      repository.getWeightRecords().catch(() => null),
    ]).then(([nextPlan, nextCatalog, weight]) => {
      if (!active) return;
      setPlan(nextPlan);
      setCatalog(nextCatalog);
      setWeightKg(weight?.currentWeightKg ?? 0);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Không thể chuẩn bị buổi tập.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [planId]));

  const exercises = useMemo(() => plan?.exercises.map((item, index) => replacements[index] ?? item) ?? [], [plan, replacements]);
  const requiredEquipment = useMemo(() => Array.from(new Set(exercises.map((exercise) => {
    const source = findCatalogMatch(exercise, catalog);
    return (source?.equipment ?? exercise.equipment)?.trim().toLowerCase();
  }).filter((item): item is string => Boolean(item) && !isBodyweight(item)))), [catalog, exercises]);
  const missingEquipment = requiredEquipment.filter((item) => available[item] === false);
  const unansweredEquipment = requiredEquipment.filter((item) => available[item] === undefined);
  const unresolved = exercises.some((exercise, index) => {
    const source = findCatalogMatch(exercise, catalog);
    const equipment = (source?.equipment ?? exercise.equipment)?.trim().toLowerCase();
    return Boolean(equipment && missingEquipment.includes(equipment) && !replacements[index]);
  });

  const start = async () => {
    if (!plan || saving || unansweredEquipment.length || unresolved) return;
    setSaving(true);
    try {
      if (Object.keys(replacements).length) {
        await getWorkoutRepository().updatePlan(plan.id, {
          ...plan,
          exercises,
          caloriesEstimate: weightKg > 0 ? estimatePlanKcal(exercises, weightKg) : 0,
        });
      }
      router.replace(`/workout/active-session?planId=${encodeURIComponent(plan.id)}` as never);
    } catch (cause) {
      Alert.alert('Không thể bắt đầu buổi tập', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (error || !plan) return <View style={styles.center}><Text style={styles.error}>{error || 'Không tìm thấy kế hoạch.'}</Text><SecondaryButton label="Quay lại" onPress={() => router.back()} /></View>;

  return (
    <View style={styles.screen}>
      <AppTopBar title="Chuẩn bị buổi tập" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card padding="md" style={styles.introCard}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.description}>{exercises.length} bài • khoảng {plan.durationMinutes} phút. Xem tư thế và kiểm tra dụng cụ trước khi bắt đầu.</Text>
        </Card>

        <Text style={styles.sectionTitle}>Bạn có sẵn dụng cụ không?</Text>
        {requiredEquipment.length === 0 ? <Text style={styles.description}>Các bài trong kế hoạch không yêu cầu dụng cụ riêng.</Text> : requiredEquipment.map((equipment) => (
          <Card key={equipment} padding="md" style={styles.equipmentCard}>
            <View style={styles.equipmentHeading}><Dumbbell size={20} color={colors.primaryDark} /><Text style={styles.equipmentName}>{equipmentLabel(equipment)}</Text></View>
            <View style={styles.choiceRow}>
              {([{ label: 'Có', value: true }, { label: 'Không có', value: false }] as const).map((choice) => (
                <TouchableOpacity key={choice.label} onPress={() => setAvailable((current) => ({ ...current, [equipment]: choice.value }))} style={[styles.choice, available[equipment] === choice.value && styles.choiceSelected]} accessibilityRole="button" accessibilityState={{ selected: available[equipment] === choice.value }}>
                  <Text style={[styles.choiceText, available[equipment] === choice.value && styles.choiceTextSelected]}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Xem trước từng bài</Text>
        {exercises.map((exercise, index) => {
          const source = findCatalogMatch(exercise, catalog);
          const equipment = (source?.equipment ?? exercise.equipment)?.trim().toLowerCase();
          const needsAlternative = Boolean(equipment && missingEquipment.includes(equipment) && !replacements[index]);
          const alternatives = needsAlternative ? bodyweightAlternatives({
            ...exercise,
            targetMuscle: exercise.targetMuscle ?? source?.primaryMuscles[0],
          }, catalog) : [];
          const images = [
            { uri: source?.imageStartUrl ?? exercise.imageStartUrl, label: 'Bắt đầu' },
            { uri: source?.imageEndUrl ?? exercise.imageEndUrl, label: 'Kết thúc' },
          ];
          return (
            <Card key={`${exercise.id}-${index}`} padding="md" style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
              <Text style={styles.description}>{exercise.sets} hiệp • {exercise.type === 'time' ? `${exercise.durationSeconds ?? 30} giây/hiệp` : `${exercise.repsPerSet ?? 10} lần/hiệp`} • {equipmentLabel(source?.equipment ?? exercise.equipment)}</Text>
              <View style={styles.imageRow}>{images.map((item) => item.uri ? (
                <View key={item.label} style={styles.imageCell}><Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" /><Text style={styles.caption}>{item.label}</Text></View>
              ) : <View key={item.label} style={styles.imageCell}><View style={styles.imageMissing}><ImageOff size={20} color={colors.textMuted} /></View><Text style={styles.caption}>{item.label}: chưa có ảnh</Text></View>)}</View>
              <Text style={styles.instruction}>{source?.instructionsVi.join(' ') ?? exercise.instructions ?? 'Chưa có hướng dẫn chi tiết.'}</Text>
              {needsAlternative ? (
                <View style={styles.alternatives}>
                  <Text style={styles.warning}>Bạn đã chọn không có {equipmentLabel(equipment)}. Hãy đổi bài hoặc sửa kế hoạch trước khi tập.</Text>
                  {alternatives.length ? alternatives.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.alternativeButton} onPress={() => setReplacements((current) => ({ ...current, [index]: replacementFromCatalog(exercise, item, weightKg) }))} accessibilityRole="button" accessibilityLabel={`Thay bằng ${item.nameVi}`}>
                      <RefreshCw size={16} color={colors.primaryDark} /><Text style={styles.alternativeText}>Thay bằng {item.nameVi}</Text>
                    </TouchableOpacity>
                  )) : <Text style={styles.description}>Thư viện chưa có bài không dụng cụ phù hợp cùng nhóm cơ.</Text>}
                  <SecondaryButton label="Chỉnh sửa kế hoạch" onPress={() => router.push(`/workout/editor?id=${encodeURIComponent(plan.id)}` as never)} />
                </View>
      ) : replacements[index] ? (
        <View style={styles.alternatives}>
          <View style={styles.replacementRow}><Check size={14} color={colors.primaryDark} /><Text style={styles.replacementNote}>Đã chọn thay bài; thay đổi sẽ được lưu khi bắt đầu.</Text></View>
          <TouchableOpacity style={styles.alternativeButton} onPress={() => setReplacements((current) => {
            const next = { ...current };
            delete next[index];
            return next;
          })} accessibilityRole="button" accessibilityLabel={`Hoàn tác thay ${exercise.name}`}>
            <RefreshCw size={16} color={colors.primaryDark} /><Text style={styles.alternativeText}>Chọn lại bài khác</Text>
          </TouchableOpacity>
        </View>
      ) : null}
            </Card>
          );
        })}
        <Text style={styles.disclaimer}>Gợi ý chỉ dựa trên nhóm cơ và dụng cụ trong thư viện, không phải đánh giá y khoa. Nếu đau hoặc không chắc kỹ thuật, hãy dừng và hỏi người có chuyên môn.</Text>
      </ScrollView>
      <View style={styles.footer}>
        {unansweredEquipment.length ? <Text style={styles.footerHint}>Chọn Có/Không có cho từng dụng cụ để tiếp tục.</Text> : unresolved ? <Text style={styles.footerHint}>Còn bài cần dụng cụ bạn không có. Hãy chọn bài thay thế hoặc sửa kế hoạch.</Text> : null}
        <PrimaryButton label={saving ? 'Đang lưu thay đổi…' : 'Bắt đầu buổi tập'} onPress={() => void start()} loading={saving} disabled={Boolean(unansweredEquipment.length || unresolved || !exercises.length)} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  introCard: { backgroundColor: colors.surface, gap: spacing.sm },
  title: { ...typography.title1, color: colors.textPrimary },
  description: { ...typography.body, color: colors.textSecondary },
  sectionTitle: { ...typography.title2, color: colors.textPrimary, marginTop: spacing.sm },
  equipmentCard: { backgroundColor: colors.surface, gap: spacing.md },
  equipmentHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  equipmentName: { ...typography.bodyBold, color: colors.textPrimary },
  choiceRow: { flexDirection: 'row', gap: spacing.sm },
  choice: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  choiceText: { ...typography.bodyMedium, color: colors.textSecondary },
  choiceTextSelected: { color: colors.primaryDark },
  exerciseCard: { backgroundColor: colors.surface, gap: spacing.sm },
  exerciseName: { ...typography.title3, color: colors.textPrimary },
  imageRow: { flexDirection: 'row', gap: spacing.sm },
  imageCell: { flex: 1, minWidth: 0, gap: spacing.xs },
  image: { width: '100%', height: 130, backgroundColor: colors.surfaceSubtle, borderRadius: radius.md },
  imageMissing: { height: 130, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSubtle, borderRadius: radius.md },
  caption: { ...typography.captionMedium, color: colors.textSecondary, textAlign: 'center' },
  instruction: { ...typography.body, color: colors.textPrimary },
  alternatives: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  warning: { ...typography.bodyMedium, color: colors.danger },
  alternativeButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.primaryLight },
  alternativeText: { ...typography.bodyMedium, color: colors.primaryDark },
  replacementNote: { ...typography.captionMedium, color: colors.primaryDark },
  replacementRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  disclaimer: { ...typography.caption, color: colors.textSecondary },
  footer: { gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  footerHint: { ...typography.captionMedium, color: colors.danger, textAlign: 'center' },
});
