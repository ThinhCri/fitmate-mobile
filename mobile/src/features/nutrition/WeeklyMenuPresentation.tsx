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
  Calendar,
  CheckCircle2,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Cookie,
  Plus,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { PlannedMealSlotViewModel, MealTimeSlot } from './nutritionTypes';
import { Card } from '@/components/design-system/Card';

export interface WeeklyMenuPresentationProps {
  onBack: () => void;
  onSelectDay: (dayIndex: number) => void;
  selectedDayIndex: number;
  menuSlots: PlannedMealSlotViewModel[];
  onMarkConsumed: (slot: PlannedMealSlotViewModel) => void;
  onReplaceMeal: (slot: PlannedMealSlotViewModel) => void;
  onAddMealSlot: (mealSlot: MealTimeSlot) => void;
}

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const MEAL_LABELS: Record<MealTimeSlot, { title: string; icon: React.ReactNode }> = {
  breakfast: { title: 'Bữa sáng', icon: <Sun size={18} color={colors.primary} /> },
  lunch: { title: 'Bữa trưa', icon: <Sunset size={18} color={colors.warning} /> },
  dinner: { title: 'Bữa tối', icon: <Moon size={18} color={colors.secondary} /> },
  snack: { title: 'Bữa phụ', icon: <Cookie size={18} color="#8B5CF6" /> },
};

export const WeeklyMenuPresentation: React.FC<WeeklyMenuPresentationProps> = ({
  onBack,
  onSelectDay,
  selectedDayIndex,
  menuSlots,
  onMarkConsumed,
  onReplaceMeal,
  onAddMealSlot,
}) => {
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
        <Text style={[typography.title3, styles.topBarTitle]}>Thực đơn tuần</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Week Days Selector */}
      <View style={styles.daysRow}>
        {DAYS.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => onSelectDay(idx)}
              style={[styles.dayChip, isSelected && styles.dayChipSelected]}
              accessibilityRole="button"
              accessibilityLabel={`Thứ ${day}`}
            >
              <Text
                style={[
                  typography.captionMedium,
                  isSelected ? styles.dayTextSelected : styles.dayTextUnselected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Meal Slots List */}
      <View style={styles.slotsCol}>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealTimeSlot[]).map((slotKey) => {
          const slotMeta = MEAL_LABELS[slotKey];
          const items = menuSlots.filter((s) => s.mealSlot === slotKey);

          return (
            <Card key={slotKey} padding="md" style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={styles.slotHeaderLeft}>
                  <View style={styles.slotIconBox}>{slotMeta.icon}</View>
                  <Text style={[typography.title3, styles.slotTitle]}>{slotMeta.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onAddMealSlot(slotKey)}
                  style={styles.addMiniBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Thêm món vào ${slotMeta.title}`}
                >
                  <Plus size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {items.length === 0 ? (
                <View style={styles.emptySlotBox}>
                  <Text style={[typography.caption, styles.emptySlotText]}>
                    Chưa lên món cho bữa này
                  </Text>
                </View>
              ) : (
                items.map((item) => (
                  <View key={item.id} style={styles.plannedItemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={[typography.bodyBold, styles.itemName]} numberOfLines={1}>
                        {item.foodName}
                      </Text>
                      <Text style={[typography.captionMedium, styles.itemKcal]}>
                        {item.calories} kcal
                      </Text>
                    </View>

                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        onPress={() => onMarkConsumed(item)}
                        style={styles.consumedBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Đánh dấu đã ăn"
                      >
                        <CheckCircle2 size={16} color={item.isCompleted ? colors.success : colors.textMuted} />
                        <Text
                          style={[
                            typography.captionMedium,
                            { color: item.isCompleted ? colors.success : colors.textSecondary },
                          ]}
                        >
                          {item.isCompleted ? 'Đã ăn' : 'Đã ăn món này'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onReplaceMeal(item)}
                        style={styles.replaceBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Thay món khác"
                      >
                        <RefreshCw size={14} color={colors.primary} />
                        <Text style={[typography.captionMedium, styles.replaceText]}>Thay món</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </Card>
          );
        })}
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
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChip: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dayTextUnselected: {
    color: colors.textSecondary,
  },
  slotsCol: {
    gap: spacing.md,
  },
  slotCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  slotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitle: {
    color: colors.textPrimary,
  },
  addMiniBtn: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  emptySlotText: {
    color: colors.textMuted,
  },
  plannedItemRow: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: colors.textPrimary,
    flex: 1,
  },
  itemKcal: {
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  consumedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
  },
  replaceText: {
    color: colors.primary,
  },
});
