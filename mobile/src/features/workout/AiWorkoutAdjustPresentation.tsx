import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Brain, Sparkles, ArrowRight, Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { AiWorkoutAdjustmentProposalViewModel } from './workoutTypes';

export interface AiWorkoutAdjustPresentationProps {
  proposal: AiWorkoutAdjustmentProposalViewModel;
  onApplyChanges: (selectedChangeIds: string[]) => void;
  onManualEdit: () => void;
}

export function AiWorkoutAdjustPresentation({
  proposal,
  onApplyChanges,
  onManualEdit,
}: AiWorkoutAdjustPresentationProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    proposal.proposedChanges.filter((c) => c.selected).map((c) => c.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === proposal.proposedChanges.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(proposal.proposedChanges.map((c) => c.id));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner with Recovery & Adaptive Status */}
      <Card style={styles.heroBanner}>
        <View style={styles.heroTop}>
          <View style={styles.aiBadge}>
            <Brain size={16} color={colors.primary} />
            <Text style={styles.aiBadgeText}>FITMATE NEURO-FIT AI</Text>
          </View>
          <Text style={styles.updateTime}>Cập nhật hôm nay</Text>
        </View>

        <View style={styles.heroBody}>
          {/* Recovery Gauge */}
          <View style={styles.recoveryCircle}>
            <Text style={styles.recoveryPercent}>{proposal.recoveryScorePercent}%</Text>
            <Text style={styles.recoveryLabel}>HỒI PHỤC</Text>
          </View>

          <View style={styles.heroPlanInfo}>
            <Text style={styles.routineCategory}>Giáo án kích hoạt</Text>
            <Text style={styles.routineTitle} numberOfLines={1}>
              {proposal.planTitle}
            </Text>
            <View style={styles.recoveryStatusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.recoveryStatusText}>{proposal.recoveryStatusText}</Text>
            </View>
          </View>
        </View>

        {/* AI Rationale Box */}
        <View style={styles.rationaleBox}>
          <Sparkles size={18} color={colors.primary} />
          <Text style={styles.rationaleText}>{proposal.rationale}</Text>
        </View>
      </Card>

      {/* Proposed Changes Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Đề xuất thay đổi</Text>
          <View style={styles.selectedCountBadge}>
            <Text style={styles.selectedCountText}>{selectedIds.length} đã chọn</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={toggleAll}
          accessibilityRole="button"
          accessibilityLabel="Chọn hoặc bỏ chọn tất cả"
        >
          <Text style={styles.toggleAllText}>
            {selectedIds.length === proposal.proposedChanges.length
              ? 'Bỏ chọn tất cả'
              : 'Chọn tất cả'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Changes Comparison Cards */}
      <View style={styles.changesList}>
        {proposal.proposedChanges.map((change) => {
          const isSelected = selectedIds.includes(change.id);
          return (
            <Card
              key={change.id}
              style={[styles.changeCard, isSelected && styles.changeCardSelected]}
            >
              <TouchableOpacity
                style={styles.changeHeader}
                onPress={() => toggleSelect(change.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Chọn đề xuất ${change.exerciseName}`}
              >
                <View style={styles.changeHeaderInfo}>
                  <View style={styles.changeNameRow}>
                    <Text style={styles.changeExerciseName}>{change.exerciseName}</Text>
                    <View style={styles.changeBadge}>
                      <Text style={styles.changeBadgeText}>{change.badgeText}</Text>
                    </View>
                  </View>
                  <Text style={styles.changeSubtitle}>{change.subtitle}</Text>
                </View>

                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Check size={16} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>

              {/* Before / After Comparison Grid */}
              <View style={styles.comparisonGrid}>
                <View style={styles.comparisonCol}>
                  <Text style={styles.compLabel}>Hiện tại</Text>
                  <Text style={styles.compValueCurrent}>{change.currentValue}</Text>
                </View>
                <ArrowRight size={18} color={colors.textMuted} />
                <View style={styles.comparisonCol}>
                  <Text style={styles.compLabel}>Đề xuất mới</Text>
                  <Text style={styles.compValueProposed}>{change.proposedValue}</Text>
                </View>
              </View>

              {/* Reason */}
              <Text style={styles.changeReason}>
                <Text style={styles.changeReasonPrefix}>Lý do: </Text>
                {change.reason}
              </Text>
            </Card>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <PrimaryButton
          label={`Áp dụng ${selectedIds.length} thay đổi`}
          disabled={selectedIds.length === 0}
          onPress={() => onApplyChanges(selectedIds)}
        />
        <SecondaryButton label="Tùy chỉnh thủ công" onPress={onManualEdit} />
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
  heroBanner: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  updateTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recoveryCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  recoveryLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heroPlanInfo: {
    flex: 1,
    gap: 2,
  },
  routineCategory: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  routineTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recoveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  recoveryStatusText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '500',
  },
  rationaleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rationaleText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedCountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  selectedCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  changesList: {
    gap: spacing.sm,
  },
  changeCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  changeCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  changeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  changeHeaderInfo: {
    flex: 1,
    paddingRight: spacing.sm,
    gap: 2,
  },
  changeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeExerciseName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  changeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  changeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  changeSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  comparisonCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  compLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  compValueCurrent: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  compValueProposed: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  changeReason: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  changeReasonPrefix: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
