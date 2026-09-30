import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  HeartPulse,
  Utensils,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Shield,
  Save,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { HealthProfileData } from './accountTypes';

export interface HealthProfilePresentationProps {
  initialValues: HealthProfileData;
  isSaving?: boolean;
  onBack: () => void;
  onSubmit: (values: HealthProfileData) => void;
}

const WEEKDAYS = [
  { key: 'mon', label: 'T2' },
  { key: 'tue', label: 'T3' },
  { key: 'wed', label: 'T4' },
  { key: 'thu', label: 'T5' },
  { key: 'fri', label: 'T6' },
  { key: 'sat', label: 'T7' },
  { key: 'sun', label: 'CN' },
];

export function HealthProfilePresentation({
  initialValues,
  isSaving = false,
  onBack,
  onSubmit,
}: HealthProfilePresentationProps) {
  const [medicalConditions, setMedicalConditions] = useState(
    initialValues.medicalConditions
  );
  const [hasNoMedicalConditions, setHasNoMedicalConditions] = useState(
    initialValues.hasNoMedicalConditions
  );
  const [allergies, setAllergies] = useState(initialValues.allergies);
  const [hasNoAllergies, setHasNoAllergies] = useState(
    initialValues.hasNoAllergies
  );
  const [workoutDays, setWorkoutDays] = useState<string[]>(
    initialValues.workoutDays
  );
  const [timeSlots, setTimeSlots] = useState<string[]>(
    initialValues.preferredTimeSlots
  );
  const [notes, setNotes] = useState(initialValues.notes);

  const toggleDay = (dayKey: string) => {
    setWorkoutDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const handleAddTimeSlot = () => {
    setTimeSlots((prev) => [...prev, '18:00 - 19:30']);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSubmit({
      medicalConditions: hasNoMedicalConditions ? '' : medicalConditions.trim(),
      hasNoMedicalConditions,
      allergies: hasNoAllergies ? '' : allergies.trim(),
      hasNoAllergies,
      workoutDays,
      preferredTimeSlots: timeSlots,
      notes: notes.trim(),
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ sức khỏe &amp; Lịch</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveBtn}
          accessibilityLabel="Lưu hồ sơ sức khỏe"
        >
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Medical Disclaimer Banner */}
        <Card style={styles.disclaimerCard}>
          <Shield size={18} color={colors.primary} />
          <Text style={styles.disclaimerText}>
            Thông tin dùng để cá nhân hóa gợi ý bài tập và thực đơn từ AI / HLV, không cấu
            thành phác đồ điều trị y khoa.
          </Text>
        </Card>

        {/* Section 1: Medical Conditions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <HeartPulse size={18} color={colors.danger} />
            <Text style={styles.sectionTitle}>Bệnh nền &amp; Chấn thương</Text>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Tôi không có bệnh nền hoặc chấn thương</Text>
            <Switch
              value={hasNoMedicalConditions}
              onValueChange={(val) => {
                setHasNoMedicalConditions(val);
                if (val) setMedicalConditions('');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {!hasNoMedicalConditions && (
            <TextInput
              style={styles.textArea}
              placeholder="Ví dụ: Đau khớp gối khi ngồi xổm sâu, thoát vị đĩa đệm nhẹ L4-L5..."
              placeholderTextColor={colors.textMuted}
              value={medicalConditions}
              onChangeText={setMedicalConditions}
              multiline
              maxLength={300}
            />
          )}
        </View>

        {/* Section 2: Allergies */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Utensils size={18} color={colors.warning} />
            <Text style={styles.sectionTitle}>Dị ứng thực phẩm</Text>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Tôi không có dị ứng thực phẩm nào</Text>
            <Switch
              value={hasNoAllergies}
              onValueChange={(val) => {
                setHasNoAllergies(val);
                if (val) setAllergies('');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {!hasNoAllergies && (
            <TextInput
              style={styles.textArea}
              placeholder="Ví dụ: Dị ứng đậu phộng, không dung nạp lactose, kiêng hải sản..."
              placeholderTextColor={colors.textMuted}
              value={allergies}
              onChangeText={setAllergies}
              multiline
              maxLength={300}
            />
          )}
        </View>

        {/* Section 3: Preferred Workout Days */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Ngày tập ưu tiên trong tuần</Text>
          </View>
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((d) => {
              const selected = workoutDays.includes(d.key);
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayPill, selected && styles.dayPillSelected]}
                  onPress={() => toggleDay(d.key)}
                >
                  <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Preferred Time Slots */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Khung giờ tập mong muốn</Text>
          </View>

          {timeSlots.map((slot, idx) => (
            <View key={idx} style={styles.slotRow}>
              <Text style={styles.slotText}>{slot}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTimeSlot(idx)}
                style={styles.removeSlotBtn}
                accessibilityLabel="Xóa khung giờ"
              >
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addSlotBtn}
            onPress={handleAddTimeSlot}
            accessibilityRole="button"
          >
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addSlotText}>Thêm khung giờ tập</Text>
          </TouchableOpacity>
        </View>

        {/* Section 5: Extra Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú thêm cho HLV / AI</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Bất kỳ lưu ý nào bạn muốn chuyên gia thể hình của Fitmate nắm rõ..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={300}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    flex: 1,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  removeSlotBtn: {
    padding: spacing.xs,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  addSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
