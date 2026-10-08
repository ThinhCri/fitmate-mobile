import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { CalendarDays, ChevronRight, Clock3, Dumbbell, Flame, History, Plus, Scale, Target } from 'lucide-react-native';
import { Card } from '@/components/design-system/Card';
import { EmptyState } from '@/components/design-system/FeedbackStates';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { WorkoutPlanViewModel } from './workoutTypes';
import { useTabBarScroll } from '@/context/TabBarVisibilityContext';
import { GradientBackground } from '@/components/design-system/GradientBackground';

export interface WorkoutOverviewPresentationProps {
  plans: WorkoutPlanViewModel[];
  completedTodayPlanIds?: string[];
  onSelectPlan: (id: string) => void;
  onCreatePlan: (day?: string) => void;
  onOpenHistory: () => void;
  onOpenGoals: () => void;
  onOpenWeight: () => void;
  monthlyCompleted: number;
  monthlyTarget: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function WorkoutOverviewPresentation({
  plans,
  completedTodayPlanIds = [],
  onSelectPlan,
  onCreatePlan,
  onOpenHistory,
  onOpenGoals,
  onOpenWeight,
  monthlyCompleted,
  monthlyTarget,
  currentWeightKg,
  targetWeightKg,
  onScroll: externalOnScroll,
}: WorkoutOverviewPresentationProps) {
  const { onScroll: handleScroll, scrollEventThrottle } = useTabBarScroll(externalOnScroll);
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
  const days = [
    { label: 'T2', value: 'Mon' }, { label: 'T3', value: 'Tue' },
    { label: 'T4', value: 'Wed' }, { label: 'T5', value: 'Thu' },
    { label: 'T6', value: 'Fri' }, { label: 'T7', value: 'Sat' },
    { label: 'CN', value: 'Sun' },
  ];
  const selectedDay = days[selectedDayIndex];
  const visiblePlans = plans.filter((plan) => plan.category.toLowerCase() === selectedDay.value.toLowerCase());
  return (
    <GradientBackground>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
    >
      <View style={styles.weekStrip}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.value}
            onPress={() => setSelectedDayIndex(index)}
            style={[styles.dayCell, index === selectedDayIndex && styles.dayCellActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: index === selectedDayIndex }}
            accessibilityLabel={`Xem kế hoạch ${day.label}`}
          >
            <Text style={[styles.dayText, index === selectedDayIndex && styles.dayTextActive]}>{day.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Kế hoạch tập luyện</Text>
          <Text style={styles.sectionSubtitle}>Dữ liệu được đồng bộ từ Fitmate</Text>
        </View>
        <TouchableOpacity onPress={onOpenHistory} style={styles.historyButton} accessibilityRole="button">
          <History size={18} color={colors.primaryDark} />
          <Text style={styles.historyText}>Lịch sử</Text>
        </TouchableOpacity>
      </View>

      <Card padding="md" style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressEyebrow}>TIẾN ĐỘ THÁNG NÀY</Text>
            <Text style={styles.progressValue}>
              {monthlyCompleted}{monthlyTarget ? `/${monthlyTarget}` : ''} buổi tập
            </Text>
          </View>
          <View style={styles.progressIcon}>
            <Target size={22} color={colors.primaryDark} />
          </View>
        </View>
        {monthlyTarget ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.round((monthlyCompleted / monthlyTarget) * 100))}%` as `${number}%` },
              ]}
            />
          </View>
        ) : (
          <Text style={styles.progressHint}>Thiết lập mục tiêu để theo dõi tiến độ mỗi tháng.</Text>
        )}
      </Card>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={onOpenGoals}
          accessibilityRole="button"
          accessibilityLabel="Thiết lập mục tiêu tập luyện"
        >
          <View style={styles.quickIcon}><Target size={21} color={colors.primaryDark} /></View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Mục tiêu tập luyện</Text>
            <Text style={styles.quickSubtitle}>
              {monthlyTarget ? `${monthlyTarget} buổi/tháng` : 'Chưa thiết lập'}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={onOpenWeight}
          accessibilityRole="button"
          accessibilityLabel="Theo dõi cân nặng"
        >
          <View style={styles.quickIcon}><Scale size={21} color={colors.primaryDark} /></View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Theo dõi cân nặng</Text>
            <Text style={styles.quickSubtitle}>
              {currentWeightKg ? `${currentWeightKg} kg${targetWeightKg ? ` • Mục tiêu ${targetWeightKg} kg` : ''}` : 'Chưa có số đo'}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {visiblePlans.length === 0 ? (
        <EmptyState title={`Chưa có kế hoạch ${selectedDay.label}`} description="Tạo kế hoạch cho ngày này để bắt đầu theo dõi tiến độ tập luyện." actionLabel="Tạo kế hoạch" onAction={() => onCreatePlan(selectedDay.value)} />
      ) : (
        <View style={styles.planList}>
          {visiblePlans.map((plan) => (
            <Card key={plan.id} onPress={() => onSelectPlan(plan.id)} accessibilityLabel={`Mở kế hoạch ${plan.title}`} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.iconBox}><Dumbbell size={22} color={colors.primaryDark} /></View>
                <View style={styles.planHeading}>
                  <Text style={styles.dayLabel}>{selectedDay.label}</Text>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.description}>{plan.description}</Text>
              <View style={styles.metrics}>
                <View style={styles.metric}><Clock3 size={15} color={colors.textSecondary} /><Text style={styles.metricText}>{plan.durationMinutes} phút</Text></View>
                <View style={styles.metric}><Flame size={15} color={colors.warning} /><Text style={styles.metricText}>{plan.caloriesEstimate > 0 ? `~${plan.caloriesEstimate} kcal` : 'Chưa ước tính'}</Text></View>
                <View style={styles.metric}><CalendarDays size={15} color={colors.textSecondary} /><Text style={styles.metricText}>{completedTodayPlanIds.includes(plan.id) ? 'Đã tập hôm nay' : plan.isActive ? 'Sẵn sàng' : 'Đã đóng kế hoạch'}</Text></View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {visiblePlans.length > 0 ? (
        <TouchableOpacity style={styles.createButton} onPress={() => onCreatePlan(selectedDay.value)} accessibilityRole="button">
          <Plus size={20} color={colors.white} />
          <Text style={styles.createButtonText}>Tạo kế hoạch mới</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg, paddingBottom: 112 },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxl },
  dayCell: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  dayCellActive: { backgroundColor: colors.primary },
  dayText: { ...typography.captionMedium, color: colors.textSecondary },
  dayTextActive: { color: colors.white, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { ...typography.title2 },
  sectionSubtitle: { ...typography.caption, marginTop: 2 },
  historyButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm },
  historyText: { ...typography.bodyMedium, color: colors.primaryDark },
  progressCard: { gap: spacing.md, marginBottom: spacing.md, backgroundColor: colors.surface },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressEyebrow: { ...typography.captionMedium, color: colors.textSecondary },
  progressValue: { ...typography.title2, color: colors.textPrimary, marginTop: spacing.xs },
  progressIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  progressTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceSubtle, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
  progressHint: { ...typography.caption, color: colors.textSecondary },
  quickActions: { gap: spacing.sm, marginBottom: spacing.xl },
  quickAction: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
  quickIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  quickText: { flex: 1, gap: 2 },
  quickTitle: { ...typography.bodyBold, color: colors.textPrimary },
  quickSubtitle: { ...typography.caption, color: colors.textSecondary },
  planList: { gap: spacing.md },
  planCard: { gap: spacing.sm },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  planHeading: { flex: 1 },
  dayLabel: { ...typography.captionMedium, color: colors.primaryDark },
  planTitle: { ...typography.title3, marginTop: 2 },
  description: { ...typography.body, color: colors.textSecondary },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm },
  metric: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metricText: { ...typography.captionMedium },
  createButton: { minHeight: 52, marginTop: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  createButtonText: { ...typography.bodyBold, color: colors.white },
});
