import React from 'react';
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
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Utensils,
  Award,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { FoodItemViewModel } from './nutritionTypes';
import { PrimaryButton, DestructiveButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/BadgesAndChips';

export interface MealDetailPresentationProps {
  food: FoodItemViewModel;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const MealDetailPresentation: React.FC<MealDetailPresentationProps> = ({
  food,
  onBack,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const mealSlotName = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
  }[food.mealSlot];

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
        <Text style={[typography.title3, styles.topBarTitle]}>Chi tiết món đã ghi</Text>
        <TouchableOpacity
          onPress={onEdit}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Chỉnh sửa"
        >
          <Edit2 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Food Card */}
      <Card padding="md" style={styles.mainCard}>
        {food.photoUri ? (
          <Image source={{ uri: food.photoUri }} style={styles.foodImage} resizeMode="cover" />
        ) : null}

        <View style={styles.badgeRow}>
          <Badge label={mealSlotName} tone="neutral" />
          {food.source === 'ai_confirmed' ? (
            <Badge label="AI ước tính, đã xác nhận" tone="success" />
          ) : (
            <Badge label="Nhập thủ công" tone="neutral" />
          )}
        </View>

        <Text style={[typography.title1, styles.foodName]}>{food.name}</Text>
        <Text style={[typography.body, styles.portionText]}>{food.portion}</Text>

        <View style={styles.heroCaloriesBox}>
          <Text style={[typography.display, styles.heroCalorieValue]}>
            {food.calories}
          </Text>
          <Text style={[typography.bodyMedium, styles.heroCalorieUnit]}>kcal</Text>
        </View>

        {food.notes ? (
          <View style={styles.notesBox}>
            <Text style={[typography.caption, styles.notesLabel]}>Ghi chú:</Text>
            <Text style={[typography.body, styles.notesContent]}>{food.notes}</Text>
          </View>
        ) : null}
      </Card>

      {/* Macronutrient Breakdown Card */}
      <Card padding="md" style={styles.macrosCard}>
        <Text style={[typography.title3, styles.sectionTitle]}>Thành phần dinh dưỡng chi tiết</Text>

        <View style={styles.macroRow}>
          <View style={styles.macroLeft}>
            <View style={[styles.macroDot, { backgroundColor: colors.primary }]} />
            <Text style={[typography.bodyMedium, styles.macroName]}>Chất đạm (Protein)</Text>
          </View>
          <Text style={[typography.bodyBold, styles.macroVal]}>{food.proteinGrams}g</Text>
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroLeft}>
            <View style={[styles.macroDot, { backgroundColor: colors.secondary }]} />
            <Text style={[typography.bodyMedium, styles.macroName]}>Đường bột (Carbs)</Text>
          </View>
          <Text style={[typography.bodyBold, styles.macroVal]}>{food.carbsGrams}g</Text>
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroLeft}>
            <View style={[styles.macroDot, { backgroundColor: colors.warning }]} />
            <Text style={[typography.bodyMedium, styles.macroName]}>Chất béo (Fat)</Text>
          </View>
          <Text style={[typography.bodyBold, styles.macroVal]}>{food.fatGrams}g</Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionCol}>
        <PrimaryButton label="Chỉnh sửa thông tin món" onPress={onEdit} fullWidth />
        <DestructiveButton
          label="Xóa món khỏi nhật ký"
          onPress={onDelete}
          loading={isDeleting}
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
  mainCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  foodImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  foodName: {
    color: colors.textPrimary,
  },
  portionText: {
    color: colors.textSecondary,
  },
  heroCaloriesBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.lg,
    borderRadius: radius.md,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  heroCalorieValue: {
    color: colors.primary,
  },
  heroCalorieUnit: {
    color: colors.textSecondary,
  },
  notesBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 2,
  },
  notesLabel: {
    color: colors.textMuted,
  },
  notesContent: {
    color: colors.textPrimary,
  },
  macrosCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  macroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  macroName: {
    color: colors.textPrimary,
  },
  macroVal: {
    color: colors.textPrimary,
  },
  actionCol: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
