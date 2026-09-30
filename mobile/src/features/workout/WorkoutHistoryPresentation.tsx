import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronDown, Check, Cloud, Dumbbell, Flame, Timer, TrendingUp, Inbox } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { WorkoutHistoryItemViewModel } from './workoutTypes';

export interface WorkoutHistoryPresentationProps {
  sessions: WorkoutHistoryItemViewModel[];
  monthlyStats: {
    monthYear: string;
    completedCount: number;
    targetCount: number;
    totalVolumeKg: number;
    caloriesBurned: number;
    averageDurationMinutes: number;
  };
  onSelectSession: (sessionId: string) => void;
  onFilterMonth?: () => void;
}

export function WorkoutHistoryPresentation({
  sessions,
  monthlyStats,
  onSelectSession,
  onFilterMonth,
}: WorkoutHistoryPresentationProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'synced'>('all');

  const pendingCount = sessions.filter((s) => s.syncStatus === 'pending').length;
  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === 'pending') return s.syncStatus === 'pending';
    if (activeFilter === 'synced') return s.syncStatus === 'synced';
    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Time & Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterSectionTitle}>Thời gian &amp; Lọc</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {/* Month Selector Chip */}
          <TouchableOpacity
            style={styles.monthChip}
            onPress={onFilterMonth}
            accessibilityRole="button"
            accessibilityLabel={`Chọn tháng, đang chọn ${monthlyStats.monthYear}`}
          >
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.monthChipText}>{monthlyStats.monthYear}</Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* All Filter */}
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
            accessibilityRole="button"
            accessibilityLabel="Lọc tất cả buổi tập"
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
            <View
              style={[
                styles.filterBadge,
                activeFilter === 'all' && styles.filterBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  activeFilter === 'all' && styles.filterBadgeTextActive,
                ]}
              >
                {sessions.length}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Pending Sync Filter */}
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'pending' && styles.filterChipActive]}
            onPress={() => setActiveFilter('pending')}
            accessibilityRole="button"
            accessibilityLabel="Lọc các buổi tập chờ đồng bộ"
          >
            <View style={styles.pendingDot} />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'pending' && styles.filterChipTextActive,
              ]}
            >
              Chờ đồng bộ
            </Text>
            {pendingCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Synced Filter */}
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'synced' && styles.filterChipActive]}
            onPress={() => setActiveFilter('synced')}
            accessibilityRole="button"
            accessibilityLabel="Lọc các buổi tập đã đồng bộ"
          >
            <Cloud
              size={16}
              color={activeFilter === 'synced' ? '#FFFFFF' : '#16A34A'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'synced' && styles.filterChipTextActive,
              ]}
            >
              Đã đồng bộ
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Monthly Summary Hero Card (Bento Grid) */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryHeaderIcon}>
            <TrendingUp size={20} color={colors.primary} />
          </View>
          <View style={styles.summaryHeaderText}>
            <Text style={styles.summaryTitle}>Tổng kết {monthlyStats.monthYear}</Text>
            <Text style={styles.summarySubtitle}>Tiến độ tập luyện &amp; thích nghi cơ bắp</Text>
          </View>
          <View style={styles.achievementTag}>
            <Text style={styles.achievementTagText}>
              {Math.round((monthlyStats.completedCount / (monthlyStats.targetCount || 1)) * 100)}%
              mục tiêu
            </Text>
          </View>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.bentoCell}>
            <View style={styles.bentoLabelRow}>
              <Dumbbell size={16} color={colors.primary} />
              <Text style={styles.bentoLabel}>Buổi hoàn tất</Text>
            </View>
            <Text style={styles.bentoValue}>
              {monthlyStats.completedCount}
              <Text style={styles.bentoSubValue}>/ {monthlyStats.targetCount} buổi</Text>
            </Text>
          </View>

          <View style={styles.bentoCell}>
            <View style={styles.bentoLabelRow}>
              <TrendingUp size={16} color="#D97706" />
              <Text style={styles.bentoLabel}>Khối lượng nâng</Text>
            </View>
            <Text style={styles.bentoValue}>
              {monthlyStats.totalVolumeKg.toLocaleString('vi-VN')}
              <Text style={styles.bentoSubValue}> kg</Text>
            </Text>
          </View>

          <View style={styles.bentoCell}>
            <View style={styles.bentoLabelRow}>
              <Flame size={16} color="#EA580C" />
              <Text style={styles.bentoLabel}>Năng lượng tiêu hao</Text>
            </View>
            <Text style={styles.bentoValue}>
              ~{monthlyStats.caloriesBurned}
              <Text style={styles.bentoSubValue}> kcal</Text>
            </Text>
          </View>

          <View style={styles.bentoCell}>
            <View style={styles.bentoLabelRow}>
              <Timer size={16} color="#0284C7" />
              <Text style={styles.bentoLabel}>Thời lượng TB</Text>
            </View>
            <Text style={styles.bentoValue}>
              {monthlyStats.averageDurationMinutes}
              <Text style={styles.bentoSubValue}> phút</Text>
            </Text>
          </View>
        </View>
      </Card>

      {/* Sessions List */}
      <View style={styles.listSection}>
        <Text style={styles.listSectionTitle}>Danh sách buổi tập</Text>

        {filteredSessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Inbox size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có buổi tập nào</Text>
            <Text style={styles.emptySubtitle}>
              Các buổi tập bạn hoàn thành sẽ xuất hiện tại đây kèm số liệu chi tiết.
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              activeOpacity={0.8}
              onPress={() => onSelectSession(session.id)}
              accessibilityRole="button"
              accessibilityLabel={`Xem chi tiết buổi tập ${session.planTitle}`}
            >
              <Card style={styles.sessionCard}>
                <View style={styles.sessionCardTop}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle} numberOfLines={1}>
                      {session.planTitle}
                    </Text>
                    <Text style={styles.sessionDate}>{session.completedAt}</Text>
                  </View>
                  <View
                    style={[
                      styles.syncBadge,
                      session.syncStatus === 'synced'
                        ? styles.syncBadgeSynced
                        : styles.syncBadgePending,
                    ]}
                  >
                    <Cloud
                      size={14}
                      color={session.syncStatus === 'synced' ? '#16A34A' : '#D97706'}
                    />
                    <Text
                      style={[
                        styles.syncBadgeText,
                        session.syncStatus === 'synced'
                          ? styles.syncBadgeTextSynced
                          : styles.syncBadgeTextPending,
                      ]}
                    >
                      {session.syncStatus === 'synced' ? 'Đã đồng bộ' : 'Chờ đồng bộ'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionMetricsRow}>
                  <View style={styles.metricItem}>
                    <Timer size={14} color={colors.textSecondary} />
                    <Text style={styles.metricItemText}>
                      {formatDuration(session.durationSeconds)}
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Dumbbell size={14} color={colors.textSecondary} />
                    <Text style={styles.metricItemText}>
                      {session.completedSets}/{session.totalSets} hiệp
                    </Text>
                  </View>
                  {session.totalVolumeKg > 0 && (
                    <View style={styles.metricItem}>
                      <TrendingUp size={14} color={colors.textSecondary} />
                      <Text style={styles.metricItemText}>
                        {session.totalVolumeKg.toLocaleString('vi-VN')} kg
                      </Text>
                    </View>
                  )}
                  <View style={styles.metricItem}>
                    <Flame size={14} color={colors.textSecondary} />
                    <Text style={styles.metricItemText}>~{session.caloriesBurned} kcal</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
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
  filterSection: {
    gap: spacing.xs,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  summaryCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeaderText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summarySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  achievementTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  achievementTagText: {
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
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 4,
  },
  bentoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bentoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bentoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bentoSubValue: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  listSection: {
    gap: spacing.sm,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sessionCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  syncBadgeSynced: {
    backgroundColor: '#DCFCE7',
  },
  syncBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  syncBadgeTextSynced: {
    color: '#16A34A',
  },
  syncBadgeTextPending: {
    color: '#D97706',
  },
  sessionMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
