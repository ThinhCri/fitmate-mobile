import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RotateCcw, StopCircle, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { ModalShell } from '@/components/design-system/ModalShell';

export interface CheckpointRestoreModalProps {
  visible: boolean;
  planTitle: string;
  startedAtText: string;
  completedSets: number;
  totalSets: number;
  currentExerciseName: string;
  progressPercent: number;
  onResume: () => void;
  onDiscard: () => void;
}

export function CheckpointRestoreModal({
  visible,
  planTitle,
  startedAtText,
  completedSets,
  totalSets,
  currentExerciseName,
  progressPercent,
  onResume,
  onDiscard,
}: CheckpointRestoreModalProps) {
  return (
    <ModalShell visible={visible} onClose={onDiscard} title="Khôi phục buổi tập">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <RotateCcw size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.badgeRow}>
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>Checkpoint tự động</Text>
              </View>
              <Text style={styles.metaText}>• {startedAtText}</Text>
            </View>
            <Text style={styles.title}>Phát hiện buổi tập chưa hoàn tất</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.routineHeader}>
            <View style={styles.dot} />
            <Text style={styles.routineTitle} numberOfLines={1}>
              Giáo án: {planTitle}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.progressBox}>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
              <Text style={styles.progressLabel}>Tiến trình</Text>
            </View>
            <View style={styles.detailsBox}>
              <Text style={styles.statLabel}>Bài tập dở dang</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {currentExerciseName}
              </Text>
              <Text style={styles.statSub}>
                Đã tập: {completedSets}/{totalSets} hiệp
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <RefreshCw size={16} color={colors.primary} />
          <Text style={styles.noticeText}>
            Dữ liệu được lưu an toàn trên máy. Bạn có thể tiếp tục ngay mà không mất lịch sử hiệp tạ.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Tiếp tục buổi tập" onPress={onResume} />
          <SecondaryButton label="Bỏ phiên tập này" onPress={onDiscard} />
        </View>
      </View>
    </ModalShell>
  );
}

export interface EndEarlyModalProps {
  visible: boolean;
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  skippedSets: number;
  onSaveAndExit: () => void;
  onContinue: () => void;
}

export function EndEarlyModal({
  visible,
  completedExercises,
  totalExercises,
  completedSets,
  skippedSets,
  onSaveAndExit,
  onContinue,
}: EndEarlyModalProps) {
  return (
    <ModalShell visible={visible} onClose={onContinue} title="Kết thúc sớm">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <StopCircle size={24} color="#D97706" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Bạn muốn kết thúc buổi tập?</Text>
            <Text style={styles.subtitle}>
              Tiến trình hiện tại sẽ được lưu vào lịch sử tập luyện.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>Bài tập hoàn tất</Text>
            <Text style={styles.gridCellValue}>
              {completedExercises}/{totalExercises}
            </Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>Hiệp đã tập</Text>
            <Text style={styles.gridCellValue}>{completedSets} hiệp</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>Hiệp bỏ qua</Text>
            <Text style={[styles.gridCellValue, { color: '#D97706' }]}>
              {skippedSets} hiệp
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Lưu kết quả & Thoát" onPress={onSaveAndExit} />
          <SecondaryButton label="Tiếp tục tập luyện" onPress={onContinue} />
        </View>
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  warningBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressLabel: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  detailsBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statSub: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  gridCellLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  gridCellValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
