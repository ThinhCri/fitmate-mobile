import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { CalendarDays, ChevronRight, Clock3, Dumbbell, Flame, History, Plus } from 'lucide-react-native';
import { Card } from '@/components/design-system/Card';
import { EmptyState } from '@/components/design-system/FeedbackStates';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { WorkoutPlanViewModel } from './workoutTypes';
import { useTabBarScroll } from '@/context/TabBarVisibilityContext';

export interface WorkoutOverviewPresentationProps {
  plans: WorkoutPlanViewModel[];
  onSelectPlan: (id: string) => void;
  onCreatePlan: () => void;
  onOpenHistory: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function WorkoutOverviewPresentation({
  plans,
  onSelectPlan,
  onCreatePlan,
  onOpenHistory,
  onScroll: externalOnScroll,
}: WorkoutOverviewPresentationProps) {
  const { onScroll: handleScroll, scrollEventThrottle } = useTabBarScroll(externalOnScroll);
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
    >
      <View style={styles.weekStrip}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
          <View key={day} style={[styles.dayCell, index === currentDayIndex && styles.dayCellActive]}>
            <Text style={[styles.dayText, index === currentDayIndex && styles.dayTextActive]}>{day}</Text>
          </View>
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

      {plans.length === 0 ? (
        <EmptyState title="Chưa có kế hoạch tập" description="Tạo kế hoạch đầu tiên để bắt đầu theo dõi tiến độ tập luyện." actionLabel="Tạo kế hoạch" onAction={onCreatePlan} />
      ) : (
        <View style={styles.planList}>
          {plans.map((plan) => (
            <Card key={plan.id} onPress={() => onSelectPlan(plan.id)} accessibilityLabel={`Mở kế hoạch ${plan.title}`} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.iconBox}><Dumbbell size={22} color={colors.primaryDark} /></View>
                <View style={styles.planHeading}>
                  <Text style={styles.dayLabel}>{plan.category}</Text>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.description}>{plan.description}</Text>
              <View style={styles.metrics}>
                <View style={styles.metric}><Clock3 size={15} color={colors.textSecondary} /><Text style={styles.metricText}>{plan.durationMinutes} phút</Text></View>
                <View style={styles.metric}><Flame size={15} color={colors.warning} /><Text style={styles.metricText}>{plan.caloriesEstimate} kcal</Text></View>
                <View style={styles.metric}><CalendarDays size={15} color={colors.textSecondary} /><Text style={styles.metricText}>{plan.isActive ? 'Sẵn sàng' : 'Đã hoàn thành'}</Text></View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.createButton} onPress={onCreatePlan} accessibilityRole="button">
        <Plus size={20} color={colors.white} />
        <Text style={styles.createButtonText}>Tạo kế hoạch mới</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
