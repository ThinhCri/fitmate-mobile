import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Sun,
  Sunset,
  Moon,
  Cookie,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { FoodCandidateViewModel, MealTimeSlot } from './nutritionTypes';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { LoadingSkeleton, ErrorState } from '@/components/design-system/FeedbackStates';

export interface CandidateReviewPresentationProps {
  imageUri?: string;
  candidates: FoodCandidateViewModel[];
  mealSlot: MealTimeSlot;
  onMealSlotChange: (slot: MealTimeSlot) => void;
  onToggleCandidate: (id: string) => void;
  onEditCandidate: (candidate: FoodCandidateViewModel) => void;
  onAddManualMissing: () => void;
  onConfirmAndSave: () => void;
  onBack: () => void;
  isAnalyzing?: boolean;
  isSaving?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const SLOTS: Array<{ slot: MealTimeSlot; label: string; icon: React.ReactNode }> = [
  { slot: 'breakfast', label: 'Sáng', icon: <Sun size={18} color={colors.primary} /> },
  { slot: 'lunch', label: 'Trưa', icon: <Sunset size={18} color={colors.warning} /> },
  { slot: 'dinner', label: 'Tối', icon: <Moon size={18} color={colors.secondary} /> },
  { slot: 'snack', label: 'Phụ', icon: <Cookie size={18} color="#8B5CF6" /> },
];

export const CandidateReviewPresentation: React.FC<CandidateReviewPresentationProps> = ({
  imageUri,
  candidates,
  mealSlot,
  onMealSlotChange,
  onToggleCandidate,
  onEditCandidate,
  onAddManualMissing,
  onConfirmAndSave,
  onBack,
  isAnalyzing = false,
  isSaving = false,
  isError = false,
  onRetry,
}) => {
  if (isAnalyzing) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSkeleton count={3} />
        <Text style={[typography.bodyMedium, styles.analyzingText]}>
          Đang phân tích ảnh món ăn bằng AI Vision...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState
          title="Không thể phân tích ảnh"
          description="Dịch vụ phân tích AI tạm thời không khả dụng hoặc ảnh chưa rõ món ăn."
          actionLabel="Thử lại"
          onAction={onRetry}
        />
        <SecondaryButton
          label="Nhập món thủ công"
          onPress={onAddManualMissing}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  const selectedCandidates = candidates.filter((c) => c.selected);
  const totalKcal = selectedCandidates.reduce((acc, c) => acc + c.calories, 0);
  const totalProtein = selectedCandidates.reduce((acc, c) => acc + c.protein, 0);
  const totalCarbs = selectedCandidates.reduce((acc, c) => acc + c.carbs, 0);
  const totalFat = selectedCandidates.reduce((acc, c) => acc + c.fat, 0);

  return (
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
        <Text style={[typography.title3, styles.topBarTitle]}>Xác nhận dinh dưỡng</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Advisory Banner */}
      <View style={styles.warningBanner}>
        <AlertTriangle size={20} color={colors.warning} style={styles.warningIcon} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, styles.warningTitle]}>
            Kết quả ước tính — hãy kiểm tra trước khi lưu
          </Text>
          <Text style={[typography.caption, styles.warningDesc]}>
            AI nhận diện món từ hình ảnh. Bạn có thể chọn/bỏ, sửa định lượng hoặc bổ sung món còn thiếu.
          </Text>
        </View>
      </View>

      {/* Scanned Image Preview & Meal Slot Choice */}
      <Card padding="md" style={styles.imageAndSlotCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : null}

        <View style={styles.slotChoiceContainer}>
          <Text style={[typography.captionMedium, styles.slotChoiceTitle]}>Lưu vào bữa ăn</Text>
          <View style={styles.slotGrid}>
            {SLOTS.map((s) => (
              <TouchableOpacity
                key={s.slot}
                onPress={() => onMealSlotChange(s.slot)}
                style={[styles.slotChip, mealSlot === s.slot && styles.slotChipSelected]}
                accessibilityRole="button"
              >
                {s.icon}
                <Text
                  style={[
                    typography.captionMedium,
                    mealSlot === s.slot ? styles.slotTextSelected : styles.slotTextUnselected,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      {/* Candidates List */}
      <Card padding="md" style={styles.candidatesCard}>
        <Text style={[typography.title3, styles.candidatesTitle]}>Món ăn nhận diện được</Text>

        {candidates.map((cand) => (
          <View key={cand.id} style={styles.candidateRow}>
            <TouchableOpacity
              onPress={() => onToggleCandidate(cand.id)}
              style={styles.checkboxTouchable}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: cand.selected }}
            >
              {cand.selected ? (
                <CheckCircle2 size={22} color={colors.primary} />
              ) : (
                <Circle size={22} color={colors.textMuted} />
              )}
            </TouchableOpacity>

            <View style={styles.candidateInfo}>
              <View style={styles.candidateNameRow}>
                <Text style={[typography.bodyBold, styles.candidateName]} numberOfLines={1}>
                  {cand.name}
                </Text>
                <TouchableOpacity
                  onPress={() => onEditCandidate(cand)}
                  style={styles.editBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Chỉnh sửa định lượng"
                >
                  <Edit2 size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <Text style={[typography.caption, styles.candidatePortion]}>
                {cand.portionDescription}
              </Text>

              <View style={styles.candidateNutrients}>
                <Text style={[typography.captionMedium, { color: colors.primary }]}>
                  {cand.calories} kcal
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  P: {cand.protein}g
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  C: {cand.carbs}g
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  F: {cand.fat}g
                </Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={onAddManualMissing}
          style={styles.addMissingBtn}
          accessibilityRole="button"
          accessibilityLabel="Thêm món còn thiếu"
        >
          <Plus size={16} color={colors.primary} />
          <Text style={[typography.bodyMedium, styles.addMissingText]}>
            Thêm món còn thiếu thủ công
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Totals Summary */}
      <Card padding="md" style={styles.totalsCard}>
        <View style={styles.totalsRow}>
          <Text style={[typography.title3, styles.totalsLabel]}>Tổng năng lượng lưu:</Text>
          <Text style={[typography.title2, styles.totalsKcal]}>{totalKcal} kcal</Text>
        </View>

        <View style={styles.totalsMacrosRow}>
          <Text style={[typography.caption, styles.totalsMacroText]}>Đạm: {totalProtein}g</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={[typography.caption, styles.totalsMacroText]}>Tinh bột: {totalCarbs}g</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={[typography.caption, styles.totalsMacroText]}>Béo: {totalFat}g</Text>
        </View>
      </Card>

      {/* CTA Buttons */}
      <View style={styles.ctaRow}>
        <PrimaryButton
          label="Xác nhận và lưu vào nhật ký"
          onPress={onConfirmAndSave}
          loading={isSaving}
          disabled={selectedCandidates.length === 0}
          fullWidth
        />
      </View>
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  analyzingText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  warningIcon: {
    marginTop: 2,
  },
  warningTitle: {
    color: '#92400E',
  },
  warningDesc: {
    color: '#B45309',
    marginTop: 2,
    lineHeight: 18,
  },
  imageAndSlotCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  slotChoiceContainer: {
    gap: spacing.xs,
  },
  slotChoiceTitle: {
    color: colors.textSecondary,
  },
  slotGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  slotChipSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  slotTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  slotTextUnselected: {
    color: colors.textSecondary,
  },
  candidatesCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  candidatesTitle: {
    color: colors.textPrimary,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.md,
  },
  checkboxTouchable: {
    paddingTop: 2,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateName: {
    color: colors.textPrimary,
    flex: 1,
  },
  editBtn: {
    padding: spacing.xs,
  },
  candidatePortion: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  candidateNutrients: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  metaDot: {
    color: colors.textMuted,
  },
  addMissingBtn: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addMissingText: {
    color: colors.primary,
  },
  totalsCard: {
    backgroundColor: colors.surfaceSubtle,
    gap: spacing.xs,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsLabel: {
    color: colors.textPrimary,
  },
  totalsKcal: {
    color: colors.primary,
  },
  totalsMacrosRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  totalsMacroText: {
    color: colors.textSecondary,
  },
  ctaRow: {
    marginTop: spacing.xs,
  },
});
