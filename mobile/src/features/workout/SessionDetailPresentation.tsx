import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle2, Cloud, History, Dumbbell, Calendar, Clock, AlertTriangle, Lock, Timer, Flame, Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { WorkoutSessionSummaryViewModel } from './workoutTypes';

export interface SessionDetailPresentationProps {
  session: WorkoutSessionSummaryViewModel;
  totalVolumeKg?: number;
  onBack: () => void;
}

export function SessionDetailPresentation({
  session,
  totalVolumeKg = 0,
}: SessionDetailPresentationProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs > 0 ? `${secs} giây` : ''}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Context Sub-bar */}
      <View style={styles.topContextBar}>
        <View style={styles.sessionIdRow}>
          <CheckCircle2 size={18} color={colors.primary} />
          <Text style={styles.sessionIdLabel}>
            Mã phiên:{' '}
            <Text style={styles.sessionIdValue}>#{session.id.slice(0, 10).toUpperCase()}</Text>
          </Text>
        </View>

        <View
          style={[
            styles.syncTag,
            session.syncStatus === 'synced' ? styles.syncTagSynced : styles.syncTagPending,
          ]}
        >
          <Cloud
            size={14}
            color={session.syncStatus === 'synced' ? '#16A34A' : '#D97706'}
          />
          <Text
            style={[
              styles.syncTagText,
              session.syncStatus === 'synced'
                ? styles.syncTagTextSynced
                : styles.syncTagTextPending,
            ]}
          >
            {session.syncStatus === 'synced' ? 'Đã đồng bộ đám mây' : 'Lưu cục bộ an toàn'}
          </Text>
        </View>
      </View>

      {/* Hero Historical Snapshot Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroTitleBox}>
            <View style={styles.snapshotBadge}>
              <History size={14} color={colors.primary} />
              <Text style={styles.snapshotBadgeText}>BẢN GHI NGUYÊN BẢN</Text>
            </View>
            <Text style={styles.heroTitle}>{session.planTitle}</Text>
          </View>
          <View style={styles.heroIcon}>
            <Dumbbell size={24} color={colors.primary} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <Calendar size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{session.startedAt}</Text>
        </View>

        <View style={styles.metaRow}>
          <Clock size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>
            Thời lượng: <Text style={styles.metaTextBold}>{formatTime(session.durationSeconds)}</Text>
          </Text>
        </View>

        {/* Sync Status Notice */}
        {session.syncStatus === 'pending' ? (
          <View style={styles.syncNoticePending}>
            <AlertTriangle size={18} color="#D97706" />
            <View style={styles.syncNoticeText}>
              <Text style={styles.syncNoticeTitle}>Chờ đồng bộ đám mây</Text>
              <Text style={styles.syncNoticeDesc}>
                Đã lưu trữ an toàn vào bộ nhớ nội bộ. Hệ thống sẽ tự đẩy lên máy chủ khi có kết nối
                mạng.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.syncNoticeSynced}>
            <CheckCircle2 size={18} color="#16A34A" />
            <View style={styles.syncNoticeText}>
              <Text style={[styles.syncNoticeTitle, { color: '#16A34A' }]}>
                Đã xác nhận trên máy chủ
              </Text>
              <Text style={[styles.syncNoticeDesc, { color: '#15803D' }]}>
                Bản ghi đã được đồng bộ với hệ thống Fitmate Cloud.
              </Text>
            </View>
          </View>
        )}

        {/* Immutability Security Note */}
        <View style={styles.immutabilityBox}>
          <Lock size={16} color={colors.textMuted} />
          <Text style={styles.immutabilityText}>
            Dữ liệu phiên tập được đóng băng nguyên vẹn tại thời điểm hoàn thành. Các chỉnh sửa giáo
            án sau này không làm thay đổi bản ghi lịch sử này.
          </Text>
        </View>
      </Card>

      {/* Summary Metrics Dashboard Bento Grid */}
      <View style={styles.metricsSection}>
        <View style={styles.metricsSectionHeader}>
          <Text style={styles.metricsTitle}>Tổng kết hiệu suất</Text>
          <View style={styles.percentBadge}>
            <Text style={styles.percentBadgeText}>
              Đạt{' '}
              {Math.round((session.completedSets / (session.totalSets || 1)) * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.bentoGrid}>
          <Card style={styles.bentoCell}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Hiệp đạt chuẩn</Text>
              <Check size={16} color={colors.primary} />
            </View>
            <Text style={styles.bentoValue}>
              {session.completedSets}
              <Text style={styles.bentoSub}>/ {session.totalSets}</Text>
            </Text>
            <Text style={styles.bentoSubLabel}>hiệp đã hoàn thành</Text>
          </Card>

          <Card style={styles.bentoCell}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Tổng tải khối</Text>
              <Dumbbell size={16} color="#0284C7" />
            </View>
            <Text style={styles.bentoValue}>
              {totalVolumeKg > 0 ? totalVolumeKg.toLocaleString('vi-VN') : '—'}
              <Text style={styles.bentoSub}>{totalVolumeKg > 0 ? ' kg' : ''}</Text>
            </Text>
            <Text style={styles.bentoSubLabel}>khối lượng tích luỹ</Text>
          </Card>

          <Card style={styles.bentoCell}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Năng lượng</Text>
              <Flame size={16} color="#EA580C" />
            </View>
            <Text style={styles.bentoValue}>
              ~{session.caloriesBurned}
              <Text style={styles.bentoSub}> kcal</Text>
            </Text>
            <Text style={styles.bentoSubLabel}>tiêu hao ước tính</Text>
          </Card>

          <Card style={styles.bentoCell}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Thời lượng</Text>
              <Timer size={16} color="#16A34A" />
            </View>
            <Text style={styles.bentoValue}>
              {Math.floor(session.durationSeconds / 60)}
              <Text style={styles.bentoSub}> phút</Text>
            </Text>
            <Text style={styles.bentoSubLabel}>thực tế vận động</Text>
          </Card>
        </View>
      </View>

      {/* Set-by-Set Records List */}
      <View style={styles.recordsSection}>
        <Text style={styles.recordsTitle}>Nhật ký chi tiết từng bài</Text>
        {session.records.map((rec, idx) => (
          <Card key={rec.exerciseId || String(idx)} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseIndex}>#{idx + 1}</Text>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {rec.exerciseName}
              </Text>
            </View>
            <View style={styles.setsList}>
              {rec.sets.map((s) => (
                <View key={s.setNumber} style={styles.setRow}>
                  <Text style={styles.setNumberLabel}>Hiệp {s.setNumber}</Text>
                  <Text style={styles.setDetail}>
                    {s.repsCompleted != null ? `${s.repsCompleted} reps` : `${s.durationSeconds}s`}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      s.status === 'completed'
                        ? styles.statusPillCompleted
                        : styles.statusPillSkipped,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        s.status === 'completed'
                          ? styles.statusPillTextCompleted
                          : styles.statusPillTextSkipped,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topContextBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionIdLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionIdValue: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  syncTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  syncTagSynced: {
    backgroundColor: '#DCFCE7',
  },
  syncTagPending: {
    backgroundColor: '#FEF3C7',
  },
  syncTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  syncTagTextSynced: {
    color: '#16A34A',
  },
  syncTagTextPending: {
    color: '#D97706',
  },
  heroCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitleBox: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  snapshotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  snapshotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaTextBold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  syncNoticePending: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  syncNoticeSynced: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#DCFCE7',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  syncNoticeText: {
    flex: 1,
  },
  syncNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  syncNoticeDesc: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  immutabilityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  immutabilityText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  metricsSection: {
    gap: spacing.sm,
  },
  metricsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  percentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  percentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bentoCell: {
    width: '48%',
    padding: spacing.md,
    gap: 4,
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bentoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bentoSub: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  bentoSubLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  recordsSection: {
    gap: spacing.sm,
  },
  recordsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  exerciseCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exerciseIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  exerciseName: {
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
  setNumberLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 60,
  },
  setDetail: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusPillCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusPillSkipped: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusPillTextCompleted: {
    color: '#16A34A',
  },
  statusPillTextSkipped: {
    color: '#D97706',
  },
});
