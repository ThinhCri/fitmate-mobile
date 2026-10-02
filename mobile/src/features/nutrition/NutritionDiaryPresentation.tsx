import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  PlusCircle,
  Camera,
  Plus,
  MoreVertical,
  Sun,
  Sunset,
  Moon,
  Cookie,
  Edit3,
  Calendar,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { DayNutritionSummaryViewModel, FoodItemViewModel, MealTimeSlot } from './nutritionTypes';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/BadgesAndChips';
import { LoadingSkeleton, EmptyState, ErrorState, OfflineState } from '@/components/design-system/FeedbackStates';

export interface NutritionDiaryPresentationProps {
  summary: DayNutritionSummaryViewModel;
  activeSegment: 'diary' | 'menu';
  onSegmentChange: (segment: 'diary' | 'menu') => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDate: () => void;
  onAddManualPress: (slot?: MealTimeSlot) => void;
  onScanPress: () => void;
  onFoodItemPress: (item: FoodItemViewModel) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isOffline?: boolean;
}

export const NutritionDiaryPresentation: React.FC<NutritionDiaryPresentationProps> = ({
  summary,
  activeSegment,
  onSegmentChange,
  onPrevDay,
  onNextDay,
  onSelectDate,
  onAddManualPress,
  onScanPress,
  onFoodItemPress,
  onRefresh,
  refreshing = false,
  isLoading = false,
  isError = false,
  isOffline = false,
}) => {
  const percent = (current: number, target: number) => target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  if (isOffline) {
    return (
      <View style={styles.centerFeedback}>
        <OfflineState title="Không có kết nối mạng" onAction={onRefresh} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerFeedback}>
        <ErrorState
          title="Không thể tải nhật ký dinh dưỡng"
          description="Đã xảy ra lỗi khi đồng bộ dữ liệu với máy chủ. Vui lòng thử lại."
          onAction={onRefresh}
        />
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return (
      <View style={styles.skeletonContainer}>
        <LoadingSkeleton count={3} />
      </View>
    );
  }

  const calorieRatio = summary.calories.target > 0
    ? Math.min(100, Math.round((summary.calories.consumed / summary.calories.target) * 100))
    : 0;

  const remainingKcal = Math.max(0, summary.calories.target - summary.calories.consumed);

  const getSlotIcon = (slot: MealTimeSlot) => {
    switch (slot) {
      case 'breakfast':
        return <Sun size={20} color={colors.primary} />;
      case 'lunch':
        return <Sunset size={20} color={colors.warning} />;
      case 'dinner':
        return <Moon size={20} color={colors.secondary} />;
      case 'snack':
      default:
        return <Cookie size={20} color="#8B5CF6" />;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        ) : undefined
      }
    >
      {/* Segment: Nhật ký vs Thực đơn */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => onSegmentChange('diary')}
          style={[styles.segmentBtn, activeSegment === 'diary' && styles.segmentBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Xem nhật ký dinh dưỡng"
        >
          <Edit3 size={16} color={activeSegment === 'diary' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              typography.bodyBold,
              activeSegment === 'diary' ? styles.segmentTextActive : styles.segmentTextInactive,
            ]}
          >
            Nhật ký
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSegmentChange('menu')}
          style={[styles.segmentBtn, activeSegment === 'menu' && styles.segmentBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Xem thực đơn tuần"
        >
          <Calendar size={16} color={activeSegment === 'menu' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              typography.bodyBold,
              activeSegment === 'menu' ? styles.segmentTextActive : styles.segmentTextInactive,
            ]}
          >
            Thực đơn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <Card padding="sm" style={styles.dateNavCard}>
        <TouchableOpacity
          onPress={onPrevDay}
          style={styles.dateNavArrow}
          accessibilityRole="button"
          accessibilityLabel="Ngày trước"
        >
          <ChevronLeft size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSelectDate}
          style={styles.dateCenter}
          accessibilityRole="button"
          accessibilityLabel={`Chọn ngày, hiện tại là ${summary.dateDisplay}`}
        >
          <Text style={[typography.title3, styles.dateDisplayText]}>{summary.dateDisplay}</Text>
          {summary.isToday ? (
            <Text style={[typography.captionMedium, styles.todayTag]}>Hôm nay</Text>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextDay}
          style={styles.dateNavArrow}
          accessibilityRole="button"
          accessibilityLabel="Ngày sau"
        >
          <ChevronRight size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* Energy & Macros Summary Card */}
      <Card padding="md" style={styles.macroCard}>
        <View style={styles.macroCardHeader}>
          <View>
            <Text style={[typography.captionMedium, styles.summarySubtitle]}>TỔNG NĂNG LƯỢNG NẠP</Text>
            <View style={styles.heroMetricRow}>
              <Text style={[typography.display, styles.heroMetricValue]}>
                {summary.calories.consumed.toLocaleString('vi-VN')}
              </Text>
              <Text style={[typography.body, styles.heroMetricTarget]}>
                {summary.calories.target > 0 ? ` / ${summary.calories.target.toLocaleString('vi-VN')} kcal` : ' kcal'}
              </Text>
            </View>
          </View>
          <View style={styles.remainingPill}>
            <Text style={[typography.caption, styles.remainingPillLabel]}>Còn lại</Text>
            <Text style={[typography.bodyBold, styles.remainingPillValue]}>
              {remainingKcal.toLocaleString('vi-VN')} kcal
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${calorieRatio}%` }]} />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={[typography.caption, styles.progressCaption]}>
            Đã nạp {calorieRatio}% mục tiêu ngày
          </Text>
          <Text style={[typography.caption, styles.progressCaption]}>
            {summary.calories.target > 0 ? `Mục tiêu: ${summary.calories.target} kcal` : 'Chưa thiết lập mục tiêu calo'}
          </Text>
        </View>

        {/* 3 Macro Columns */}
        <View style={styles.macroGrid}>
          <View style={styles.macroCol}>
            <View style={styles.macroColHeader}>
              <Text style={[typography.captionMedium, styles.macroTitle]}>Đạm</Text>
              <Text style={[typography.captionMedium, { color: colors.primary }]}>
                {percent(summary.macros.protein.current, summary.macros.protein.target)}%
              </Text>
            </View>
            <Text style={[typography.bodyBold, styles.macroValue]}>
              {summary.macros.protein.current}g{' '}
              <Text style={[typography.caption, styles.macroTarget]}>{summary.macros.protein.target > 0 ? `/ ${summary.macros.protein.target}g` : 'chưa có mục tiêu'}</Text>
            </Text>
            <View style={styles.macroMiniTrack}>
              <View
                style={[
                  styles.macroMiniFill,
                  {
                    width: `${percent(summary.macros.protein.current, summary.macros.protein.target)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.macroCol}>
            <View style={styles.macroColHeader}>
              <Text style={[typography.captionMedium, styles.macroTitle]}>Tinh bột</Text>
              <Text style={[typography.captionMedium, { color: colors.secondary }]}>
                {percent(summary.macros.carbs.current, summary.macros.carbs.target)}%
              </Text>
            </View>
            <Text style={[typography.bodyBold, styles.macroValue]}>
              {summary.macros.carbs.current}g{' '}
              <Text style={[typography.caption, styles.macroTarget]}>{summary.macros.carbs.target > 0 ? `/ ${summary.macros.carbs.target}g` : 'chưa có mục tiêu'}</Text>
            </Text>
            <View style={styles.macroMiniTrack}>
              <View
                style={[
                  styles.macroMiniFill,
                  {
                    width: `${percent(summary.macros.carbs.current, summary.macros.carbs.target)}%`,
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.macroCol}>
            <View style={styles.macroColHeader}>
              <Text style={[typography.captionMedium, styles.macroTitle]}>Chất béo</Text>
              <Text style={[typography.captionMedium, { color: colors.warning }]}>
                {percent(summary.macros.fat.current, summary.macros.fat.target)}%
              </Text>
            </View>
            <Text style={[typography.bodyBold, styles.macroValue]}>
              {summary.macros.fat.current}g{' '}
              <Text style={[typography.caption, styles.macroTarget]}>{summary.macros.fat.target > 0 ? `/ ${summary.macros.fat.target}g` : 'chưa có mục tiêu'}</Text>
            </Text>
            <View style={styles.macroMiniTrack}>
              <View
                style={[
                  styles.macroMiniFill,
                  {
                    width: `${percent(summary.macros.fat.current, summary.macros.fat.target)}%`,
                    backgroundColor: colors.warning,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Burned Energy Separation Notice */}
        <View style={styles.burnedBanner}>
          <View style={styles.burnedIconCircle}>
            <Flame size={18} color={colors.warning} />
          </View>
          <View style={styles.burnedTextCol}>
            <Text style={[typography.bodyMedium, styles.burnedValueText]}>
              Vận động đã đốt: <Text style={styles.burnedHighlight}>{summary.calories.burnedExercise} kcal</Text>
            </Text>
            <Text style={[typography.caption, styles.burnedSubtext]}>
              Ước tính từ buổi tập, tách biệt khỏi chỉ số dinh dưỡng nạp
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Action CTAs */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          onPress={() => onAddManualPress()}
          style={styles.primaryActionBtn}
          accessibilityRole="button"
          accessibilityLabel="Thêm món thủ công"
        >
          <PlusCircle size={20} color={colors.white} />
          <Text style={[typography.bodyBold, styles.primaryActionText]}>Thêm thủ công</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onScanPress}
          style={styles.secondaryActionBtn}
          accessibilityRole="button"
          accessibilityLabel="Quét món ăn bằng camera AI"
        >
          <Camera size={20} color={colors.primary} />
          <Text style={[typography.bodyBold, styles.secondaryActionText]}>Quét món ăn AI</Text>
        </TouchableOpacity>
      </View>

      {/* Meals Sections */}
      {summary.meals.length === 0 ? (
        <EmptyState
          title="Chưa có món nào hôm nay"
          description="Hãy bấm 'Thêm thủ công' hoặc 'Quét món ăn AI' để bắt đầu ghi nhận dinh dưỡng."
          actionLabel="Ghi bữa ăn đầu tiên"
          onAction={() => onAddManualPress('breakfast')}
        />
      ) : (
        summary.meals.map((section) => (
          <Card key={section.slot} padding="md" style={styles.mealSectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <View style={styles.slotIconBox}>{getSlotIcon(section.slot)}</View>
                <View>
                  <Text style={[typography.title3, styles.sectionTitle]}>{section.title}</Text>
                  <Text style={[typography.caption, styles.sectionSubtitle]}>{section.subtitle}</Text>
                </View>
              </View>
              <Text style={[typography.title3, styles.sectionKcal]}>
                {section.totalCalories.toLocaleString('vi-VN')} kcal
              </Text>
            </View>

            {/* Food items */}
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onFoodItemPress(item)}
                style={styles.foodRow}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.portion}, ${item.calories} kcal`}
              >
                <View style={styles.foodInfo}>
                  <Text style={[typography.bodyBold, styles.foodName]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.foodMetaRow}>
                    <Text style={[typography.caption, styles.foodPortion]}>{item.portion}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={[typography.captionMedium, styles.foodKcal]}>{item.calories} kcal</Text>
                    {item.source === 'ai_confirmed' ? (
                      <Badge label="AI ước tính" tone="success" style={styles.sourceBadge} />
                    ) : item.source === 'manual' ? (
                      <Badge label="Thủ công" tone="neutral" style={styles.sourceBadge} />
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => onFoodItemPress(item)}
                  style={styles.moreBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Tùy chọn món"
                >
                  <MoreVertical size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            {/* Add to this meal */}
            <TouchableOpacity
              onPress={() => onAddManualPress(section.slot)}
              style={styles.addSlotBtn}
              accessibilityRole="button"
              accessibilityLabel={`Thêm món vào ${section.title}`}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={[typography.bodyMedium, styles.addSlotText]}>
                Thêm món vào {section.title.toLowerCase()}
              </Text>
            </TouchableOpacity>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  centerFeedback: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  skeletonContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  segmentTextInactive: {
    color: colors.textSecondary,
  },
  dateNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  dateNavArrow: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateDisplayText: {
    color: colors.textPrimary,
  },
  todayTag: {
    color: colors.primary,
    marginTop: 2,
  },
  macroCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  macroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summarySubtitle: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  heroMetricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: 2,
  },
  heroMetricValue: {
    color: colors.textPrimary,
  },
  heroMetricTarget: {
    color: colors.textSecondary,
  },
  remainingPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'flex-end',
  },
  remainingPillLabel: {
    color: colors.primaryDark,
  },
  remainingPillValue: {
    color: colors.primaryDark,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCaption: {
    color: colors.textSecondary,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroCol: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 4,
  },
  macroColHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroTitle: {
    color: colors.textSecondary,
  },
  macroValue: {
    color: colors.textPrimary,
  },
  macroTarget: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  macroMiniTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: 2,
  },
  macroMiniFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  burnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  burnedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burnedTextCol: {
    flex: 1,
  },
  burnedValueText: {
    color: colors.textPrimary,
  },
  burnedHighlight: {
    color: colors.warning,
    fontWeight: '700',
  },
  burnedSubtext: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryActionBtn: {
    flex: 1,
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primaryActionText: {
    color: colors.white,
  },
  secondaryActionBtn: {
    flex: 1,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  secondaryActionText: {
    color: colors.primary,
  },
  mealSectionCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
  },
  sectionKcal: {
    color: colors.textPrimary,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: colors.textPrimary,
  },
  foodMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  foodPortion: {
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textMuted,
  },
  foodKcal: {
    color: colors.primary,
  },
  sourceBadge: {
    marginLeft: spacing.xs,
  },
  moreBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotBtn: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addSlotText: {
    color: colors.primary,
  },
});
