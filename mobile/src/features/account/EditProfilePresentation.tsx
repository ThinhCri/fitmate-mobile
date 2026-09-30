import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  Camera,
  Eye,
  HeartPulse,
  Scale,
  Lock,
  Calendar,
  Save,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { Avatar } from '@/components/design-system/Avatar';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { ModalShell } from '@/components/design-system/ModalShell';
import { UserProfileFormData } from './accountTypes';

export interface EditProfilePresentationProps {
  initialValues: UserProfileFormData;
  isSaving?: boolean;
  onBack: () => void;
  onSubmit: (values: UserProfileFormData) => void;
  onPreviewPublicProfile: () => void;
  onHealthProfilePress: () => void;
  onWeightHistoryPress: () => void;
}

export function EditProfilePresentation({
  initialValues,
  isSaving = false,
  onBack,
  onSubmit,
  onPreviewPublicProfile,
  onHealthProfilePress,
  onWeightHistoryPress,
}: EditProfilePresentationProps) {
  const [formData, setFormData] = useState<UserProfileFormData>(initialValues);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialValues);

  const handleBack = () => {
    if (isDirty && !isSaving) {
      setShowExitConfirm(true);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSaving || !isDirty}
          style={[styles.saveHeaderBtn, (!isDirty || isSaving) && styles.saveHeaderBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Lưu thay đổi"
        >
          <Text style={styles.saveHeaderText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar name={formData.name} size="lg" />
            <TouchableOpacity
              style={styles.cameraIconBtn}
              onPress={() => Alert.alert('Đổi ảnh', 'Tính năng chọn ảnh đại diện')}
              accessibilityLabel="Thay đổi ảnh đại diện"
            >
              <Camera size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.publicPreviewLink}
            onPress={onPreviewPublicProfile}
          >
            <Eye size={14} color={colors.primary} />
            <Text style={styles.publicPreviewText}>Xem trước hồ sơ công khai (F05)</Text>
          </TouchableOpacity>
        </View>

        {/* Public Information Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin công khai</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nhập họ và tên"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Giới thiệu ngắn (Bio)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Chia sẻ mục tiêu thể chất hoặc sở thích tập luyện..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mục tiêu tập luyện</Text>
            <TextInput
              style={styles.input}
              value={formData.fitnessGoal}
              onChangeText={(text) => setFormData({ ...formData, fitnessGoal: text })}
              placeholder="Ví dụ: Tăng cơ giảm mỡ, Tăng thể lực"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Private Personal Metrics Section */}
        <View style={styles.formSection}>
          <View style={styles.privateHeaderRow}>
            <Text style={styles.sectionTitle}>Chỉ số cá nhân</Text>
            <View style={styles.privatePill}>
              <Lock size={10} color={colors.textSecondary} />
              <Text style={styles.privatePillText}>Chỉ mình bạn thấy</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="0912 345 678"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formData.birthday}
              onChangeText={(text) => setFormData({ ...formData, birthday: text })}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Chiều cao (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.heightCm ? String(formData.heightCm) : ''}
                onChangeText={(text) =>
                  setFormData({ ...formData, heightCm: Number(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <View style={styles.weightLabelRow}>
                <Text style={styles.fieldLabel}>Cân nặng (kg)</Text>
                <TouchableOpacity onPress={onWeightHistoryPress}>
                  <Text style={styles.historyLinkText}>Lịch sử đo →</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={formData.weightKg ? String(formData.weightKg) : ''}
                onChangeText={(text) =>
                  setFormData({ ...formData, weightKg: Number(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Health Profile Link CTA */}
        <TouchableOpacity onPress={onHealthProfilePress} activeOpacity={0.8}>
          <Card style={styles.healthCard}>
            <View style={styles.healthIconBox}>
              <HeartPulse size={20} color={colors.primary} />
            </View>
            <View style={styles.healthTextBox}>
              <Text style={styles.healthTitle}>Hồ sơ sức khỏe &amp; Lịch tập (A08)</Text>
              <Text style={styles.healthDesc}>
                Cập nhật bệnh nền, dị ứng và khung giờ tập tối ưu cho bạn.
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>

      {/* Unsaved Changes Modal */}
      <ModalShell
        visible={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Bỏ thay đổi?"
      >
        <Text style={styles.modalText}>
          Bạn có thay đổi chưa lưu. Bạn có muốn thoát mà không lưu không?
        </Text>
        <View style={styles.modalButtons}>
          <SecondaryButton
            label="Thoát không lưu"
            onPress={() => {
              setShowExitConfirm(false);
              onBack();
            }}
          />
          <PrimaryButton
            label="Tiếp tục sửa"
            onPress={() => setShowExitConfirm(false)}
          />
        </View>
      </ModalShell>
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
  saveHeaderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  saveHeaderBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveHeaderText: {
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
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  publicPreviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  publicPreviewText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  formSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  privateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  privatePillText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  weightLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLinkText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  healthIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthTextBox: {
    flex: 1,
    gap: 2,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  healthDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  modalText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalButtons: {
    gap: spacing.sm,
  },
});
