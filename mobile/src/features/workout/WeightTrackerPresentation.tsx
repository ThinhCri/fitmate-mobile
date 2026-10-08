import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { TrendingDown, TrendingUp, Clock, PlusCircle, Scale, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { WeightRecordViewModel } from './workoutTypes';

export interface WeightTrackerPresentationProps {
  currentWeightKg: number;
  goalWeightKg: number;
  changeLast7DaysKg: number;
  lastMeasuredText: string;
  records: WeightRecordViewModel[];
  onAddRecord: (weightKg: number, notes?: string) => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateGoal?: (weightKg: number) => Promise<void> | void;
}

export function WeightTrackerPresentation({
  currentWeightKg,
  goalWeightKg,
  changeLast7DaysKg,
  lastMeasuredText,
  records,
  onAddRecord,
  onDeleteRecord,
  onUpdateGoal,
}: WeightTrackerPresentationProps) {
  const [selectedRange, setSelectedRange] = useState<'7d' | '1m' | '3m' | '1y'>('7d');
  const [inputWeight, setInputWeight] = useState('');
  const [inputNotes, setInputNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState(goalWeightKg > 0 ? String(goalWeightKg) : '');
  const [goalError, setGoalError] = useState<string | null>(null);

  const hasGoal = goalWeightKg > 0;
  const remainingToGoal = hasGoal ? Math.abs(currentWeightKg - goalWeightKg) : 0;

  const handleSave = () => {
    const val = parseFloat(inputWeight.replace(',', '.'));
    if (isNaN(val) || val <= 20 || val >= 300) {
      setFormError('Vui lòng nhập cân nặng hợp lệ (20kg - 300kg)');
      return;
    }
    setFormError(null);
    onAddRecord(val, inputNotes.trim() ? inputNotes.trim() : undefined);
    setInputWeight('');
    setInputNotes('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topSubtitle}>Chỉ số sinh trắc</Text>
          <Text style={styles.topTitle}>Tiến trình thể trọng</Text>
        </View>
      </View>

      {/* Hero Metric Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Cân nặng hiện tại</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>{currentWeightKg.toFixed(1)}</Text>
              <Text style={styles.heroUnit}>kg</Text>
            </View>
          </View>
          <View
            style={[
              styles.trendBadge,
              changeLast7DaysKg <= 0 ? styles.trendBadgeLoss : styles.trendBadgeGain,
            ]}
          >
            {changeLast7DaysKg <= 0 ? (
              <TrendingDown size={16} color="#16A34A" />
            ) : (
              <TrendingUp size={16} color="#D97706" />
            )}
            <Text
              style={[
                styles.trendBadgeText,
                changeLast7DaysKg <= 0 ? styles.trendTextLoss : styles.trendTextGain,
              ]}
            >
              {changeLast7DaysKg > 0 ? `+${changeLast7DaysKg.toFixed(1)}` : `${changeLast7DaysKg.toFixed(1)}`} kg
            </Text>
          </View>
        </View>

        {/* Secondary Insights Pills */}
        <View style={styles.insightsRow}>
          <View style={styles.insightCell}>
            <Text style={styles.insightLabel}>Mục tiêu</Text>
            <Text style={styles.insightValue}>{hasGoal ? `${goalWeightKg.toFixed(1)} kg` : 'Chưa thiết lập'}</Text>
            {hasGoal ? <Text style={styles.insightHighlight}>
              {currentWeightKg === goalWeightKg
                ? 'Đã đạt mục tiêu'
                : `${currentWeightKg > goalWeightKg ? 'Cần giảm' : 'Cần tăng'} ${remainingToGoal.toFixed(1)} kg`}
            </Text> : null}
          </View>

          <View style={styles.insightCell}>
            <Text style={styles.insightLabel}>Nhịp độ 7 ngày</Text>
            <Text style={styles.insightValue}>
              {changeLast7DaysKg <= 0 ? changeLast7DaysKg.toFixed(1) : `+${changeLast7DaysKg.toFixed(1)}`} kg
            </Text>
          </View>
        </View>

        <View style={styles.lastMeasuredRow}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.lastMeasuredText}>Lần đo cuối: {lastMeasuredText}</Text>
        </View>
      </Card>

      <Card style={styles.addFormCard}>
        <Text style={styles.addFormTitle}>Thiết lập cân nặng mục tiêu</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mục tiêu (kg)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: 65"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={goalInput}
              onChangeText={setGoalInput}
            />
          </View>
          <PrimaryButton
            label="Lưu mục tiêu"
            onPress={() => {
              const value = Number(goalInput.replace(',', '.'));
              if (value < 20 || value > 400) {
                setGoalError('Mục tiêu cân nặng phải từ 20 đến 400 kg');
                return;
              }
              setGoalError(null);
              void onUpdateGoal?.(value);
            }}
          />
        </View>
        {goalError ? <Text style={styles.errorText}>{goalError}</Text> : null}
      </Card>

      {/* Range Filter Tabs */}
      <View style={styles.rangeTabsContainer}>
        {(['7d', '1m', '3m', '1y'] as const).map((r) => {
          const labelMap = { '7d': '7 ngày', '1m': '1 tháng', '3m': '3 tháng', '1y': '1 năm' };
          return (
            <TouchableOpacity
              key={r}
              style={[styles.rangeTab, selectedRange === r && styles.rangeTabActive]}
              onPress={() => setSelectedRange(r)}
              accessibilityRole="button"
              accessibilityLabel={`Lọc theo ${labelMap[r]}`}
            >
              <Text
                style={[styles.rangeTabText, selectedRange === r && styles.rangeTabTextActive]}
              >
                {labelMap[r]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Add Form Section */}
      <Card style={styles.addFormCard}>
        <View style={styles.addFormHeader}>
          <PlusCircle size={20} color={colors.primary} />
          <Text style={styles.addFormTitle}>Ghi nhận cân nặng mới</Text>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cân nặng (kg)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: 67.5"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={inputWeight}
              onChangeText={setInputWeight}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1.5 }]}>
            <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Đo sáng sau khi dậy..."
              placeholderTextColor={colors.textMuted}
              value={inputNotes}
              onChangeText={setInputNotes}
            />
          </View>
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <PrimaryButton label="Lưu số đo" onPress={handleSave} />
      </Card>

      {/* Weight History List */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Lịch sử đo gần đây</Text>
        {records.length === 0 ? (
          <View style={styles.emptyBox}>
            <Scale size={36} color={colors.textMuted} />
            <Text style={styles.emptyText}>Chưa có dữ liệu đo cân nặng</Text>
          </View>
        ) : (
          records.map((item) => (
            <Card key={item.id} style={styles.recordItem}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordWeight}>{item.weightKg.toFixed(1)} kg</Text>
                <Text style={styles.recordDate}>{item.recordedAt}</Text>
                {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}
              </View>
              <View style={styles.recordRight}>
                {item.differenceFromPreviousKg != null && (
                  <Text
                    style={[
                      styles.recordDiff,
                      item.differenceFromPreviousKg <= 0 ? styles.diffLoss : styles.diffGain,
                    ]}
                  >
                    {item.differenceFromPreviousKg > 0
                      ? `+${item.differenceFromPreviousKg.toFixed(1)}`
                      : `${item.differenceFromPreviousKg.toFixed(1)}`}{' '}
                    kg
                  </Text>
                )}
                {onDeleteRecord && (
                  <TouchableOpacity
                    onPress={() => onDeleteRecord(item.id)}
                    style={styles.deleteBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Xóa lần đo này"
                  >
                    <Trash2 size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
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
  topHeader: {
    paddingTop: spacing.xs,
  },
  topSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
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
  heroLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  heroUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  trendBadgeLoss: {
    backgroundColor: '#DCFCE7',
  },
  trendBadgeGain: {
    backgroundColor: '#FEF3C7',
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trendTextLoss: {
    color: '#16A34A',
  },
  trendTextGain: {
    color: '#D97706',
  },
  insightsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  insightCell: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 2,
  },
  insightLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  insightValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  insightHighlight: {
    color: colors.primary,
    fontSize: 11,
  },
  lastMeasuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  lastMeasuredText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rangeTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#eaefed',
    padding: 3,
    borderRadius: radius.lg,
    gap: 2,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  rangeTabActive: {
    backgroundColor: colors.surface,
    elevation: 1,
  },
  rangeTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  rangeTabTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  addFormCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  addFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  historySection: {
    gap: spacing.sm,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  recordLeft: {
    flex: 1,
    gap: 2,
  },
  recordWeight: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recordNotes: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recordDiff: {
    fontSize: 12,
    fontWeight: '600',
  },
  diffLoss: {
    color: '#16A34A',
  },
  diffGain: {
    color: '#D97706',
  },
  deleteBtn: {
    padding: 4,
  },
});
