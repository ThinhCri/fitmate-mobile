import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  RotateCcw,
  Info,
  Sun,
  Sunset,
  Moon,
  Cookie,
  Flame,
  Trash2,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { MealTimeSlot, FoodItemViewModel } from './nutritionTypes';
import { InputField } from '@/components/design-system/Inputs';
import { PrimaryButton, DestructiveButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';

export interface ManualMealEntryFormValues {
  name: string;
  mealSlot: MealTimeSlot;
  quantity: string;
  unit: string;
  grams: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  notes?: string;
}

export interface ManualMealEntryPresentationProps {
  initialValues?: Partial<FoodItemViewModel>;
  isEditing?: boolean;
  onBack: () => void;
  onSubmit: (values: ManualMealEntryFormValues) => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

const MEAL_SLOTS: Array<{ slot: MealTimeSlot; label: string; icon: React.ReactNode }> = [
  { slot: 'breakfast', label: 'Sáng', icon: <Sun size={18} color={colors.primary} /> },
  { slot: 'lunch', label: 'Trưa', icon: <Sunset size={18} color={colors.warning} /> },
  { slot: 'dinner', label: 'Tối', icon: <Moon size={18} color={colors.secondary} /> },
  { slot: 'snack', label: 'Phụ', icon: <Cookie size={18} color="#8B5CF6" /> },
];

const UNITS = ['Bát / Tô', 'Gam (g)', 'Chén', 'Khẩu phần', 'Dĩa / Đĩa'];

export const ManualMealEntryPresentation: React.FC<ManualMealEntryPresentationProps> = ({
  initialValues,
  isEditing = false,
  onBack,
  onSubmit,
  onDelete,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [mealSlot, setMealSlot] = useState<MealTimeSlot>(initialValues?.mealSlot ?? 'breakfast');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('Bát / Tô');
  const [grams, setGrams] = useState(initialValues?.grams ? String(initialValues.grams) : '200');
  const [calories, setCalories] = useState(
    initialValues?.calories ? String(initialValues.calories) : ''
  );
  const [protein, setProtein] = useState(
    initialValues?.proteinGrams ? String(initialValues.proteinGrams) : '0'
  );
  const [carbs, setCarbs] = useState(
    initialValues?.carbsGrams ? String(initialValues.carbsGrams) : '0'
  );
  const [fat, setFat] = useState(
    initialValues?.fatGrams ? String(initialValues.fatGrams) : '0'
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Vui lòng nhập tên món ăn';
    }
    const calNum = Number(calories);
    if (!calories.trim() || isNaN(calNum) || calNum <= 0) {
      errs.calories = 'Calories phải lớn hơn 0';
    }
    const qtyNum = Number(quantity);
    if (!quantity.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      errs.quantity = 'Số lượng không hợp lệ';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    setName('');
    setMealSlot('breakfast');
    setQuantity('1');
    setUnit('Bát / Tô');
    setGrams('200');
    setCalories('');
    setProtein('0');
    setCarbs('0');
    setFat('0');
    setNotes('');
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      mealSlot,
      quantity,
      unit,
      grams,
      calories,
      protein,
      carbs,
      fat,
      notes,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[typography.title3, styles.screenTitle]}>
            {isEditing ? 'Chỉnh sửa món ăn' : 'Thêm món thủ công'}
          </Text>

          {!isEditing ? (
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              accessibilityRole="button"
              accessibilityLabel="Đặt lại biểu mẫu"
            >
              <RotateCcw size={16} color={colors.textSecondary} />
              <Text style={[typography.captionMedium, styles.resetText]}>Đặt lại</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* Informative Banner */}
        <View style={styles.infoBanner}>
          <Info size={18} color={colors.primary} style={styles.infoIcon} />
          <Text style={[typography.caption, styles.infoText]}>
            Dữ liệu dinh dưỡng được ghi vào nhật ký cá nhân để đối soát mục tiêu hàng ngày. Vui lòng nhập thông tin sát thực tế nhất.
          </Text>
        </View>

        {/* Food details section */}
        <Card padding="md" style={styles.sectionCard}>
          <InputField
            label="Tên món ăn *"
            placeholder="Ví dụ: Phở bò, Cơm tấm, Ức gà áp chảo..."
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />

          <View style={styles.mealSlotSection}>
            <Text style={[typography.captionMedium, styles.slotLabel]}>Bữa ăn áp dụng</Text>
            <View style={styles.slotGrid}>
              {MEAL_SLOTS.map((item) => (
                <TouchableOpacity
                  key={item.slot}
                  onPress={() => setMealSlot(item.slot)}
                  style={[styles.slotChip, mealSlot === item.slot && styles.slotChipSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`Bữa ${item.label}`}
                >
                  {item.icon}
                  <Text
                    style={[
                      typography.bodyMedium,
                      mealSlot === item.slot ? styles.slotTextSelected : styles.slotTextUnselected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Portion & Quantity */}
        <Card padding="md" style={styles.sectionCard}>
          <Text style={[typography.title3, styles.cardTitle]}>Khẩu phần & Khối lượng</Text>
          <View style={styles.portionRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Số lượng"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                error={errors.quantity}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[typography.captionMedium, styles.slotLabel]}>Đơn vị</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[styles.unitChip, unit === u && styles.unitChipSelected]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        typography.captionMedium,
                        unit === u ? styles.unitTextSelected : styles.unitTextUnselected,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <InputField
            label="Ước tính khối lượng thực tế (gram)"
            keyboardType="numeric"
            value={grams}
            onChangeText={setGrams}
            placeholder="Ví dụ: 200"
          />
        </Card>

        {/* Nutrition Values */}
        <Card padding="md" style={styles.sectionCard}>
          <Text style={[typography.title3, styles.cardTitle]}>Thành phần dinh dưỡng</Text>
          <InputField
            label="Tổng năng lượng (kcal) *"
            keyboardType="numeric"
            placeholder="Ví dụ: 350"
            value={calories}
            onChangeText={(txt) => {
              setCalories(txt);
              if (errors.calories) setErrors((prev) => ({ ...prev, calories: '' }));
            }}
            error={errors.calories}
          />

          <View style={styles.macrosInputRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Đạm (g)"
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Tinh bột (g)"
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Chất béo (g)"
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                placeholder="0"
              />
            </View>
          </View>

          <InputField
            label="Ghi chú (tùy chọn)"
            placeholder="Ví dụ: Ít đường, không hành..."
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        {/* Submit Actions */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            label={isEditing ? 'Lưu thay đổi' : 'Lưu vào nhật ký'}
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
          />

          {isEditing && onDelete ? (
            <DestructiveButton
              label="Xóa món khỏi nhật ký"
              onPress={onDelete}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
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
  screenTitle: {
    color: colors.textPrimary,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  resetText: {
    color: colors.textSecondary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  slotLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mealSlotSection: {
    marginTop: spacing.xs,
  },
  slotGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
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
  portionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  unitScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  unitChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  unitChipSelected: {
    backgroundColor: colors.primary,
  },
  unitTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  unitTextUnselected: {
    color: colors.textSecondary,
  },
  macrosInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ctaContainer: {
    marginTop: spacing.sm,
  },
});
