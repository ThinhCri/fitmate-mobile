import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Utensils,
  Camera,
  Dumbbell,
  Calendar,
  Flame,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';
import { MemberDashboardSummary } from '@/services/api/types';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { useTabBarScroll } from '@/context/TabBarVisibilityContext';
import { GradientBackground } from '@/components/design-system/GradientBackground';
import { Avatar } from '@/components/design-system/Avatar';

export interface MemberHomePresentationProps {
  data: MemberDashboardSummary;
  unreadNotificationCount?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  onLogMealPress?: () => void;
  onScanMealPress?: () => void;
  onStartWorkoutPress?: () => void;
  onUpcomingAppointmentPress?: (appointmentId: string) => void;
  onWorkoutDetailPress?: (workoutId: string) => void;
  onNotificationPress?: () => void;
  onAccountPress?: () => void;
  onGoalsPress?: () => void;
  onMealPress?: (mealId: string) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const MemberHomePresentation: React.FC<MemberHomePresentationProps> = ({
  data,
  unreadNotificationCount = 0,
  onRefresh,
  refreshing = false,
  onLogMealPress,
  onScanMealPress,
  onStartWorkoutPress,
  onUpcomingAppointmentPress,
  onWorkoutDetailPress,
  onNotificationPress,
  onAccountPress,
  onGoalsPress,
  onMealPress,
  onScroll: externalOnScroll,
}) => {
  const { onScroll: handleScroll, scrollEventThrottle } = useTabBarScroll(externalOnScroll);

  const caloriePercent = data.calories.target > 0
    ? Math.min(100, Math.round((data.calories.consumed / data.calories.target) * 100))
    : 0;
  const macroPercent = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <GradientBackground>
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
      <View style={styles.headerRow}>
        <View style={styles.greetingCol}>
          <Text style={[typography.display, styles.greetingText]}>
            Chào {data.greetingName}! 👋
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={onNotificationPress}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel="Thông báo"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell size={22} color={colors.textPrimary} />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onAccountPress}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel="Mở tài khoản và cài đặt"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Avatar uri={data.avatarUrl} name={data.greetingName} size="sm" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.mainCard, shadow.card]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[typography.title3, styles.cardTitle]}>Năng lượng hôm nay</Text>
          <View style={styles.streakBadge}>
            <Flame size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={[typography.captionMedium, styles.streakText]}>
              {data.streakDays} ngày liên tiếp
            </Text>
          </View>
        </View>

        <View style={styles.calorieStatsRow}>
          <View style={styles.calorieStatItem}>
            <Text style={[typography.caption, styles.statLabel]}>Đã nạp</Text>
            <Text style={[typography.title1, styles.statValuePrimary]}>
              {data.calories.consumed}
            </Text>
            <Text style={[typography.caption, styles.statUnit]}>kcal</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.calorieStatItem}>
            <Text style={[typography.caption, styles.statLabel]}>Mục tiêu</Text>
            <Text style={[typography.title1, styles.statValue]}>
              {data.calories.target > 0 ? data.calories.target : '—'}
            </Text>
            <Text style={[typography.caption, styles.statUnit]}>kcal</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.calorieStatItem}>
            <Text style={[typography.caption, styles.statLabel]}>Tiêu hao</Text>
            <Text style={[typography.title1, styles.statValueBurned]}>
              {data.calories.burned}
            </Text>
            <Text style={[typography.caption, styles.statUnit]}>kcal</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${caloriePercent}%` },
            ]}
          />
        </View>
        <Text style={[typography.caption, styles.progressCaption]}>
          {data.calories.target > 0 ? `Đã đạt ${caloriePercent}% mục tiêu năng lượng hàng ngày` : 'Chưa thiết lập mục tiêu năng lượng'}
        </Text>
        {data.calories.target <= 0 ? (
          <TouchableOpacity style={styles.goalCta} onPress={onGoalsPress} accessibilityRole="button">
            <Text style={[typography.captionMedium, styles.goalCtaText]}>Thiết lập mục tiêu dinh dưỡng</Text>
            <ChevronRight size={17} color={colors.primary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.macrosRow}>
          <View style={styles.macroCol}>
            <Text style={[typography.caption, styles.macroName]}>Đạm (Protein)</Text>
            <Text style={[typography.bodyBold, styles.macroVal]}>
              {data.macros.protein.currentGrams}g{data.macros.protein.targetGrams > 0 ? ` / ${data.macros.protein.targetGrams}g` : ''}
            </Text>
            <View style={styles.macroBarBg}>
              <View
                style={[
                  styles.macroBarFill,
                  {
                    width: `${macroPercent(data.macros.protein.currentGrams, data.macros.protein.targetGrams)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.macroCol}>
            <Text style={[typography.caption, styles.macroName]}>Đường bột (Carbs)</Text>
            <Text style={[typography.bodyBold, styles.macroVal]}>
              {data.macros.carbs.currentGrams}g{data.macros.carbs.targetGrams > 0 ? ` / ${data.macros.carbs.targetGrams}g` : ''}
            </Text>
            <View style={styles.macroBarBg}>
              <View
                style={[
                  styles.macroBarFill,
                  {
                    width: `${macroPercent(data.macros.carbs.currentGrams, data.macros.carbs.targetGrams)}%`,
                    backgroundColor: colors.warning,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.macroCol}>
            <Text style={[typography.caption, styles.macroName]}>Chất béo (Fat)</Text>
            <Text style={[typography.bodyBold, styles.macroVal]}>
              {data.macros.fat.currentGrams}g{data.macros.fat.targetGrams > 0 ? ` / ${data.macros.fat.targetGrams}g` : ''}
            </Text>
            <View style={styles.macroBarBg}>
              <View
                style={[
                  styles.macroBarFill,
                  {
                    width: `${macroPercent(data.macros.fat.currentGrams, data.macros.fat.targetGrams)}%`,
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionMargin}>
        <SectionHeader title="Thao tác nhanh" />
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, shadow.card]}
            onPress={onLogMealPress}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryLight }]}>
              <Utensils size={22} color={colors.primaryDark} />
            </View>
            <Text style={[typography.bodyMedium, styles.actionTitle]}>Ghi bữa ăn</Text>
            <Text style={[typography.caption, styles.actionSubtitle]}>Nhập thủ công</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, shadow.card]}
            onPress={onScanMealPress}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.infoLight }]}>
              <Camera size={22} color={colors.info} />
            </View>
            <Text style={[typography.bodyMedium, styles.actionTitle]}>Quét món ăn</Text>
            <Text style={[typography.caption, styles.actionSubtitle]}>Sắp ra mắt</Text>
          </TouchableOpacity>

          {data.todayWorkout ? <TouchableOpacity
            style={[styles.quickActionCard, shadow.card]}
            onPress={() => onWorkoutDetailPress?.(data.todayWorkout!.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.warningLight }]}>
              <Dumbbell size={22} color="#D97706" />
            </View>
            <Text style={[typography.bodyMedium, styles.actionTitle]}>{data.todayWorkout.resourceType === 'session' ? 'Tiếp tục tập' : 'Buổi tập hôm nay'}</Text>
            <Text style={[typography.caption, styles.actionSubtitle]}>{data.todayWorkout.title}</Text>
          </TouchableOpacity> : null}

          {data.upcomingAppointment ? <TouchableOpacity
            style={[styles.quickActionCard, shadow.card]}
            onPress={() => onUpcomingAppointmentPress?.(data.upcomingAppointment!.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Calendar size={22} color="#9333EA" />
            </View>
            <Text style={[typography.bodyMedium, styles.actionTitle]}>Lịch hẹn sắp tới</Text>
            <Text style={[typography.caption, styles.actionSubtitle]}>{data.upcomingAppointment.trainerName}</Text>
          </TouchableOpacity> : null}
        </View>
      </View>

      <View style={styles.sectionMargin}>
        <SectionHeader title="Buổi tập hôm nay" />
        {data.todayWorkout ? (
          <TouchableOpacity
            style={[styles.workoutCard, shadow.card]}
            onPress={() => onWorkoutDetailPress?.(data.todayWorkout!.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={styles.workoutIconCircle}>
              <Dumbbell size={24} color={colors.white} />
            </View>
            <View style={styles.workoutInfoCol}>
              <Text style={[typography.title3, styles.workoutTitle]}>
                {data.todayWorkout.title}
              </Text>
              <Text style={[typography.caption, styles.workoutDetails]}>
                {data.todayWorkout.durationMinutes} phút{data.todayWorkout.exerciseCount > 0 ? ` • ${data.todayWorkout.exerciseCount} bài tập` : ''}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.noWorkoutBox, shadow.card]}>
            <Text style={[typography.body, styles.noWorkoutText]}>
              Hôm nay là ngày nghỉ hoặc chưa có lịch tập.
            </Text>
            <PrimaryButton
              label="Chọn bài tập ngay"
              onPress={onStartWorkoutPress || (() => {})}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </View>

      {data.upcomingAppointment ? (
        <View style={styles.sectionMargin}>
          <SectionHeader title="Lịch hẹn PT sắp tới" />
          <TouchableOpacity style={[styles.workoutCard, shadow.card]} onPress={() => onUpcomingAppointmentPress?.(data.upcomingAppointment!.id)} accessibilityRole="button">
            <View style={styles.workoutIconCircle}><Calendar size={23} color={colors.white} /></View>
            <View style={styles.workoutInfoCol}>
              <Text style={[typography.title3, styles.workoutTitle]}>{data.upcomingAppointment.trainerName}</Text>
              <Text style={[typography.caption, styles.workoutDetails]}>{new Date(data.upcomingAppointment.slotStartUtc).toLocaleString('vi-VN')} • {data.upcomingAppointment.durationMinutes} phút</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.sectionMargin}>
        <SectionHeader
          title="Bữa ăn đã ghi nhận"
          actionText="+ Thêm món"
          onAction={onLogMealPress}
        />
        {data.todayMeals.length === 0 ? <Text style={[typography.body, styles.noWorkoutText]}>Chưa có bữa ăn nào được ghi hôm nay.</Text> : null}
        {data.todayMeals.map((meal) => (
          <TouchableOpacity key={meal.id} style={[styles.mealItemRow, shadow.card]} onPress={() => onMealPress?.(meal.id)} accessibilityRole="button">
            <View style={styles.mealIconBox}>
              <CheckCircle2 size={18} color={colors.primary} />
            </View>
            <View style={styles.mealInfoCol}>
              <Text style={[typography.bodyMedium, styles.mealName]}>
                {meal.name}
              </Text>
              <Text style={[typography.caption, styles.mealTime]}>
                {meal.time}
              </Text>
            </View>
            <Text style={[typography.bodyBold, styles.mealCalories]}>
              {meal.calories} kcal
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingCol: {
    flex: 1,
  },
  greetingText: {
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface,
    position: 'relative',
  },
  notificationBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    position: 'absolute',
    top: -3,
    right: -3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  streakText: {
    color: '#B45309',
    marginLeft: 4,
    fontWeight: '600',
  },
  calorieStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  calorieStatItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    color: colors.textPrimary,
  },
  statValuePrimary: {
    color: colors.primaryDark,
  },
  statValueBurned: {
    color: colors.secondary,
  },
  statUnit: {
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  progressBarBg: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressCaption: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  goalCta: {
    minHeight: 44,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  goalCtaText: { color: colors.primary },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  macroCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  macroName: {
    color: colors.textSecondary,
  },
  macroVal: {
    color: colors.textPrimary,
    marginTop: 2,
  },
  macroBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceSubtle,
    marginTop: 6,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionMargin: {
    marginTop: spacing.xl,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 136,
    minHeight: 116,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 16,
    textAlign: 'center',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  workoutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  workoutInfoCol: {
    flex: 1,
  },
  workoutTitle: {
    color: colors.textPrimary,
  },
  workoutDetails: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  noWorkoutBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface,
  },
  noWorkoutText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  waterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  waterTitle: {
    color: colors.textPrimary,
  },
  waterAmount: {
    color: colors.info,
  },
  waterProgressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.infoLight,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  waterProgressBarFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: 3,
  },
  addWaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.infoLight,
    gap: spacing.xs,
  },
  addWaterText: {
    color: colors.info,
    fontWeight: '600',
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  mealIconBox: {
    marginRight: spacing.md,
  },
  mealInfoCol: {
    flex: 1,
  },
  mealName: {
    color: colors.textPrimary,
  },
  mealTime: {
    color: colors.textMuted,
  },
  mealCalories: {
    color: colors.textPrimary,
  },
});
