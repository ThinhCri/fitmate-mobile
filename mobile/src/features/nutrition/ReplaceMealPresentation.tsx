import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { PlannedMealSlotViewModel } from './nutritionTypes';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';

export interface ReplacementOption {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ReplaceMealPresentationProps {
  currentMeal: PlannedMealSlotViewModel;
  suggestions: ReplacementOption[];
  onBack: () => void;
  onConfirmReplacement: (chosen: ReplacementOption) => void;
  isSaving?: boolean;
}

export const ReplaceMealPresentation: React.FC<ReplaceMealPresentationProps> = ({
  currentMeal,
  suggestions,
  onBack,
  onConfirmReplacement,
  isSaving = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>(suggestions[0]?.id ?? '');

  const chosenOption = suggestions.find((s) => s.id === selectedId);

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
        <Text style={[typography.title3, styles.topBarTitle]}>Thay món dự kiến</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Current Meal Card */}
      <Card padding="md" style={styles.currentCard}>
        <Text style={[typography.captionMedium, styles.cardSubtitle]}>MÓN HIỆN TẠI</Text>
        <View style={styles.mealRow}>
          <Text style={[typography.bodyBold, styles.mealName]}>{currentMeal.foodName}</Text>
          <Text style={[typography.bodyBold, styles.mealKcal]}>{currentMeal.calories} kcal</Text>
        </View>
      </Card>

      {/* Replacement Suggestions */}
      <Card padding="md" style={styles.suggestionsCard}>
        <View style={styles.suggestionsHeader}>
          <Sparkles size={18} color={colors.primary} />
          <Text style={[typography.title3, styles.suggestionsTitle]}>
            Gợi ý món thay thế tương đương
          </Text>
        </View>

        {suggestions.map((opt) => {
          const isSelected = opt.id === selectedId;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setSelectedId(opt.id)}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={styles.radioBox}>
                {isSelected ? (
                  <CheckCircle2 size={22} color={colors.primary} />
                ) : (
                  <Circle size={22} color={colors.textMuted} />
                )}
              </View>

              <View style={styles.optionInfo}>
                <View style={styles.optionNameRow}>
                  <Text style={[typography.bodyBold, styles.optionName]}>{opt.name}</Text>
                  <Text style={[typography.bodyBold, styles.optionKcal]}>{opt.calories} kcal</Text>
                </View>
                <Text style={[typography.caption, styles.optionPortion]}>{opt.portion}</Text>
                <Text style={[typography.caption, styles.optionMacros]}>
                  P: {opt.protein}g • C: {opt.carbs}g • F: {opt.fat}g
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Card>

      {/* Difference Preview */}
      {chosenOption ? (
        <Card padding="md" style={styles.diffCard}>
          <Text style={[typography.captionMedium, styles.diffTitle]}>CHÊNH LỆCH NĂNG LƯỢNG</Text>
          <View style={styles.diffRow}>
            <Text style={[typography.body, styles.diffText]}>
              {currentMeal.calories} kcal
            </Text>
            <ArrowRight size={16} color={colors.textSecondary} />
            <Text style={[typography.bodyBold, styles.diffTargetText]}>
              {chosenOption.calories} kcal
            </Text>
            <Text style={[typography.captionMedium, styles.diffDelta]}>
              ({chosenOption.calories - currentMeal.calories >= 0 ? '+' : ''}
              {chosenOption.calories - currentMeal.calories} kcal)
            </Text>
          </View>
        </Card>
      ) : null}

      {/* CTA Button */}
      <View style={styles.ctaRow}>
        <PrimaryButton
          label="Xác nhận thay món"
          onPress={() => {
            if (chosenOption) onConfirmReplacement(chosenOption);
          }}
          disabled={!chosenOption}
          loading={isSaving}
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
  currentCard: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    color: colors.textPrimary,
  },
  mealKcal: {
    color: colors.textSecondary,
  },
  suggestionsCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  suggestionsTitle: {
    color: colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    gap: spacing.md,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  radioBox: {
    paddingTop: 2,
  },
  optionInfo: {
    flex: 1,
  },
  optionNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: {
    color: colors.textPrimary,
    flex: 1,
  },
  optionKcal: {
    color: colors.primaryDark,
  },
  optionPortion: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  optionMacros: {
    color: colors.textMuted,
    marginTop: 2,
  },
  diffCard: {
    backgroundColor: colors.surfaceSubtle,
    gap: spacing.xs,
  },
  diffTitle: {
    color: colors.textSecondary,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diffText: {
    color: colors.textSecondary,
  },
  diffTargetText: {
    color: colors.textPrimary,
  },
  diffDelta: {
    color: colors.primary,
  },
  ctaRow: {
    marginTop: spacing.xs,
  },
});
