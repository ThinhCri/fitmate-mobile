import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle, Timer, Dumbbell, Flame, Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { WorkoutSessionSummaryViewModel } from './workoutTypes';
import { setResultLabel } from './setResultLabel';

export interface WorkoutSummaryPresentationProps {
  summary: WorkoutSessionSummaryViewModel;
  onDone: () => void;
  onViewDetails: () => void;
}

export function WorkoutSummaryPresentation({
  summary,
  onDone,
  onViewDetails,
}: WorkoutSummaryPresentationProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Completion Trophy Card */}
      <Card style={styles.trophyCard}>
        <View style={styles.trophyRow}>
          <View style={styles.trophyIcon}>
            <CheckCircle size={32} color="#16A34A" />
          </View>
          <View style={styles.trophyText}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{summary.planTitle}</Text>
            </View>
            <Text style={styles.trophyTitle}>{summary.status === 'endedEarly' ? 'Đã lưu buổi tập' : 'Buổi tập đã hoàn thành!'}</Text>
            <Text style={styles.trophySubtitle}>
              Bạn đã thực hiện {summary.completedSets}/{summary.totalSets} hiệp. Kết quả đã được lưu vào lịch sử.
            </Text>
          </View>
        </View>
      </Card>

      {/* 4 Hero Metrics Grid */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Thời lượng</Text>
            <Timer size={18} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>{formatTime(summary.durationSeconds)}</Text>
          <Text style={styles.metricSub}>phút:giây</Text>
        </Card>

        <Card style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Hiệp hoàn tất</Text>
            <Dumbbell size={18} color="#0284C7" />
          </View>
          <Text style={styles.metricValue}>
            {summary.completedSets}
            <Text style={styles.metricValueSub}>/{summary.totalSets}</Text>
          </Text>
          <Text style={styles.metricSub}>hiệp</Text>
        </Card>

        <Card style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Bài tập</Text>
            <Check size={18} color="#16A34A" />
          </View>
          <Text style={styles.metricValue}>
            {summary.completedExercises}
            <Text style={styles.metricValueSub}>/{summary.totalExercises}</Text>
          </Text>
          <Text style={styles.metricSub}>bài hoàn thành</Text>
        </Card>

        <Card style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Năng lượng</Text>
            <Flame size={18} color="#EA580C" />
          </View>
          <Text style={styles.metricValue}>~{summary.caloriesBurned}</Text>
          <Text style={styles.metricSub}>kcal tiêu hao</Text>
        </Card>
      </View>

      {/* Exercise Records List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết hiệp tập đã lưu</Text>
        {summary.records.map((rec, idx) => (
          <Card key={rec.exerciseId || String(idx)} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordIndex}>#{idx + 1}</Text>
              <Text style={styles.recordName} numberOfLines={1}>
                {rec.exerciseName}
              </Text>
            </View>
            <View style={styles.setsList}>
              {rec.sets.map((s) => (
                <View key={s.setNumber} style={styles.setRow}>
                  <Text style={styles.setRowLabel}>Hiệp {s.setNumber}</Text>
                  <Text style={styles.setRowDetail}>
                    {setResultLabel(s, rec)}
                  </Text>
                  <View
                    style={[
                      styles.setStatusBadge,
                      s.status === 'completed'
                        ? styles.statusBadgeCompleted
                        : styles.statusBadgeSkipped,
                    ]}
                  >
                    <Text
                      style={[
                        styles.setStatusText,
                        s.status === 'completed'
                          ? styles.statusTextCompleted
                          : styles.statusTextSkipped,
                      ]}
                    >
                      {s.status === 'completed' ? 'Hoàn thành' : 'Bỏ qua'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <PrimaryButton label="Về lịch tập" onPress={onDone} />
        <SecondaryButton label="Xem chi tiết bản ghi" onPress={onViewDetails} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  trophyCard: {
    padding: spacing.md,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  trophyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyText: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  trophyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trophySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '48%',
    padding: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricValueSub: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  metricSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  recordName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  setsList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setRowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 60,
  },
  setRowDetail: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  setStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusBadgeCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeSkipped: {
    backgroundColor: '#FEF3C7',
  },
  setStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: '#16A34A',
  },
  statusTextSkipped: {
    color: '#D97706',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
