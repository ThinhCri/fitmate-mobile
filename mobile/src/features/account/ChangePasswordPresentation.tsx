import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PasswordInput } from '@/components/design-system/Inputs';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { ChangePasswordFormData } from './accountTypes';

export interface ChangePasswordPresentationProps {
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: (values: ChangePasswordFormData) => void;
}

export function ChangePasswordPresentation({
  isSubmitting = false,
  onBack,
  onSubmit,
}: ChangePasswordPresentationProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const hasMinLength = newPassword.length >= 12 && newPassword.length <= 128;
  const hasLetterAndNumber =
    /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const isValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasLetterAndNumber &&
    passwordsMatch;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert(
        'Kiểm tra thông tin',
        'Vui lòng đảm bảo mật khẩu mới thỏa mãn các tiêu chí bảo mật và khớp nhau.'
      );
      return;
    }
    onSubmit({
      currentPassword,
      newPassword,
      confirmPassword,
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
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Notice Card */}
        <Card style={styles.noticeCard}>
          <ShieldAlert size={18} color={colors.warning} />
          <Text style={styles.noticeText}>
            Sau khi đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại trên các thiết bị khác để
            bảo vệ tài khoản.
          </Text>
        </Card>

        {/* Inputs */}
        <View style={styles.fieldsContainer}>
          <PasswordInput
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Nhập mật khẩu hiện tại"
          />

          <PasswordInput
            label="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Từ 12 đến 128 ký tự"
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
          />
        </View>

        {/* Password Requirements Checklist */}
        <View style={styles.checklist}>
          <Text style={styles.checklistTitle}>Yêu cầu bảo mật mật khẩu:</Text>
          <View style={styles.checkItem}>
            <CheckCircle2
              size={14}
              color={hasMinLength ? colors.success : colors.textMuted}
            />
            <Text
              style={[
                styles.checkText,
                hasMinLength && styles.checkTextValid,
              ]}
            >
              Độ dài từ 12 đến 128 ký tự
            </Text>
          </View>
          <View style={styles.checkItem}>
            <CheckCircle2
              size={14}
              color={hasLetterAndNumber ? colors.success : colors.textMuted}
            />
            <Text
              style={[
                styles.checkText,
                hasLetterAndNumber && styles.checkTextValid,
              ]}
            >
              Bao gồm cả chữ cái và chữ số
            </Text>
          </View>
          <View style={styles.checkItem}>
            <CheckCircle2
              size={14}
              color={passwordsMatch ? colors.success : colors.textMuted}
            />
            <Text
              style={[
                styles.checkText,
                passwordsMatch && styles.checkTextValid,
              ]}
            >
              Mật khẩu xác nhận trùng khớp
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.btnWrapper}>
          <PrimaryButton
            label={isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    padding: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  fieldsContainer: {
    gap: spacing.md,
  },
  checklist: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkTextValid: {
    color: colors.success,
    fontWeight: '600',
  },
  btnWrapper: {
    marginTop: spacing.sm,
  },
});
