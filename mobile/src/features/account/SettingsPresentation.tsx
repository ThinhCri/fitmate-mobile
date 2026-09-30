import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Shield,
  Bell,
  Globe,
  Sun,
  FileText,
  Info,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';

export interface SettingsPresentationProps {
  onBack: () => void;
  onChangePasswordPress: () => void;
  onNotificationSettingsPress: () => void;
  onPrivacyPress: () => void;
  onTermsPress: () => void;
}

export function SettingsPresentation({
  onBack,
  onChangePasswordPress,
  onNotificationSettingsPress,
  onPrivacyPress,
  onTermsPress,
}: SettingsPresentationProps) {
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
        <Text style={styles.headerTitle}>Cài đặt hệ thống</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản &amp; Bảo mật</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={onChangePasswordPress}
            >
              <View style={styles.rowLeft}>
                <KeyRound size={18} color={colors.primary} />
                <Text style={styles.rowTitle}>Đổi mật khẩu</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.row} onPress={onPrivacyPress}>
              <View style={styles.rowLeft}>
                <Shield size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Dữ liệu &amp; Quyền riêng tư</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section 2: Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn ứng dụng</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={onNotificationSettingsPress}
            >
              <View style={styles.rowLeft}>
                <Bell size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Quyền thông báo</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Globe size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Ngôn ngữ hiển thị</Text>
              </View>
              <Text style={styles.rowValue}>Tiếng Việt (Mặc định)</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Sun size={18} color={colors.warning} />
                <Text style={styles.rowTitle}>Giao diện</Text>
              </View>
              <Text style={styles.rowValue}>Light Theme</Text>
            </View>
          </Card>
          <Text style={styles.themeNote}>
            • Giao diện Light Theme tiêu chuẩn được tinh chỉnh độ tương phản tối ưu cho tập luyện ngoài trời và phòng gym.
          </Text>
        </View>

        {/* Section 3: Legal & About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
          <Card style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={onTermsPress}>
              <View style={styles.rowLeft}>
                <FileText size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Điều khoản dịch vụ &amp; Chính sách</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Info size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Phiên bản</Text>
              </View>
              <Text style={styles.rowValue}>1.0.0 (Build 20260930)</Text>
            </View>
          </Card>
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
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  card: {
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  themeNote: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginLeft: 4,
  },
});
