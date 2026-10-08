import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  MoreVertical,
  Dumbbell,
  CheckCircle2,
  Clock,
  Flame,
  ListOrdered,
  Edit2,
  Trash2,
  Play,
  Info,
  Award,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { WorkoutPlanViewModel, ExerciseItemViewModel } from './workoutTypes';
import { PrimaryButton, SecondaryButton, DestructiveButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/BadgesAndChips';

export interface PlanDetailPresentationProps {
  plan: WorkoutPlanViewModel;
  onBack: () => void;
  onStartSession: () => void;
  onEditPlan: () => void;
  onDeletePlan: () => void;
  onExercisePress?: (exercise: ExerciseItemViewModel) => void;
}

export const PlanDetailPresentation: React.FC<PlanDetailPresentationProps> = ({
  plan,
  onBack,
  onStartSession,
  onEditPlan,
  onDeletePlan,
  onExercisePress,
}) => {
  return (
    <View style={styles.root}>
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
          <Text style={[typography.title3, styles.topBarTitle]}>Chi tiết kế hoạch</Text>
          <TouchableOpacity
            onPress={onEditPlan}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Tùy chọn kế hoạch"
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Plan Summary Card */}
        <Card padding="md" style={styles.planCard}>
          <View style={styles.badgeRow}>
            <Badge label={plan.category} tone="neutral" />
            {plan.isActive ? <Badge label="Đang áp dụng" tone="success" /> : null}
          </View>

          <Text style={[typography.title1, styles.planTitle]}>{plan.title}</Text>
          <Text style={[typography.body, styles.planDesc]}>{plan.description}</Text>

          {/* 3 Metrics Row */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <Clock size={16} color={colors.primary} />
                <Text style={[typography.bodyBold, styles.metricVal]}>
                  {plan.durationMinutes} phút
                </Text>
              </View>
              <Text style={[typography.caption, styles.metricLabel]}>Thời lượng</Text>
            </View>

            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <ListOrdered size={16} color={colors.secondary} />
                <Text style={[typography.bodyBold, styles.metricVal]}>
                  {plan.exercises.length} bài
                </Text>
              </View>
              <Text style={[typography.caption, styles.metricLabel]}>Tổng số bài</Text>
            </View>

            <View style={styles.metricCol}>
              <View style={styles.metricHeader}>
                <Flame size={16} color={colors.warning} />
                <Text style={[typography.bodyBold, styles.metricVal]}>
                  {plan.caloriesEstimate > 0 ? `~${plan.caloriesEstimate} kcal` : 'Chưa ước tính'}
                </Text>
              </View>
              <Text style={[typography.caption, styles.metricLabel]}>Tiêu hao ước tính</Text>
            </View>
          </View>

          {/* Quick Edit/Delete buttons */}
          <View style={styles.planActionsRow}>
            <SecondaryButton
              label="Chỉnh sửa giáo án"
              onPress={onEditPlan}
              style={{ flex: 1 }}
              leftIcon={<Edit2 size={16} color={colors.textPrimary} />}
            />
            <DestructiveButton
              label="Xóa"
              onPress={onDeletePlan}
              style={{ minWidth: 80 }}
            />
          </View>
        </Card>

        {/* Coach Supervision Card */}
        {plan.coachName ? (
          <Card padding="md" style={styles.coachCard}>
            <View style={styles.coachRow}>
              <View style={styles.coachAvatar}>
                <Award size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.coachNameRow}>
                  <Text style={[typography.bodyBold, styles.coachName]}>{plan.coachName}</Text>
                  {plan.coachVerified ? (
                    <Badge label="Đã hiệu đính" tone="success" style={{ marginLeft: 6 }} />
                  ) : null}
                </View>
                <Text style={[typography.caption, styles.coachSubtitle]}>
                  Hiệu đính chuẩn an toàn cơ khớp
                </Text>
              </View>
            </View>

            {plan.coachNotes ? (
              <View style={styles.coachNotesBox}>
                <Info size={16} color={colors.warning} style={{ marginTop: 2 }} />
                <Text style={[typography.body, styles.coachNotesText]}>
                  {plan.coachNotes}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <View style={styles.exerciseSectionHeader}>
            <Text style={[typography.title3, styles.sectionTitle]}>Danh sách bài tập</Text>
            <View style={styles.exerciseCountBadge}>
              <Text style={[typography.captionMedium, styles.exerciseCountText]}>
                {plan.exercises.length}
              </Text>
            </View>
          </View>

          {plan.exercises.map((ex, idx) => (
            <TouchableOpacity
              key={ex.id}
              onPress={() => onExercisePress?.(ex)}
              style={styles.exerciseRow}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${ex.name}, ${ex.sets} hiệp`}
            >
              <View style={styles.exerciseOrderCircle}>
                <Text style={[typography.captionMedium, styles.orderText]}>{idx + 1}</Text>
              </View>

              <View style={styles.exerciseInfoCol}>
                <Text style={[typography.bodyBold, styles.exerciseName]} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={[typography.caption, styles.exerciseMeta]}>
                  {ex.type === 'reps'
                    ? `${ex.sets} hiệp • ${ex.repsPerSet ?? 10} lần/hiệp`
                    : `${ex.sets} hiệp • ${ex.durationSeconds ?? 30} giây/hiệp`}
                  {'  •  '}Nghỉ {ex.restSeconds}s
                </Text>
              </View>

              <Text style={[typography.captionMedium, styles.exerciseKcal]}>
                {ex.caloriesEstimate > 0 ? `~${ex.caloriesEstimate} kcal` : 'Chưa ước tính'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Start Button */}
      <View style={styles.stickyFooter}>
        <PrimaryButton
          label="Bắt đầu tập ngay"
          onPress={onStartSession}
          fullWidth
          leftIcon={<Play size={18} color={colors.white} fill={colors.white} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 100,
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
  planCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  planTitle: {
    color: colors.textPrimary,
  },
  planDesc: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    color: colors.textPrimary,
  },
  metricLabel: {
    color: colors.textSecondary,
  },
  planActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  coachCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachName: {
    color: colors.textPrimary,
  },
  coachSubtitle: {
    color: colors.textSecondary,
  },
  coachNotesBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  coachNotesText: {
    flex: 1,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  exercisesSection: {
    gap: spacing.sm,
  },
  exerciseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  exerciseCountBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCountText: {
    color: colors.textSecondary,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  exerciseOrderCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  exerciseInfoCol: {
    flex: 1,
  },
  exerciseName: {
    color: colors.textPrimary,
  },
  exerciseMeta: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  exerciseKcal: {
    color: colors.primary,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
