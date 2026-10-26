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
  ExternalLink,
  KeyRound,
  Shield,
  Bell,
  Camera,
  Globe,
  Sun,
  FileText,
  Info,
} from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { SettingsViewModel } from './accountTypes';
import { AnalyticsPreference } from './AnalyticsPreference';
import type { PermissionStatus } from '@/services/settingsPermissions';

function PermissionIndicator({ status }: { status: PermissionStatus }) {
  return <View style={styles.permissionIndicator}>
    <Text style={[styles.permissionStatus, { color: status === 'enabled' ? colors.primary : status === 'disabled' ? colors.danger : colors.textSecondary }]}>
      {status === 'enabled' ? 'Đang bật' : status === 'disabled' ? 'Đang tắt' : 'Chưa xác định'}
    </Text>
    <ExternalLink size={14} color={colors.textSecondary} />
  </View>;
}

export interface SettingsPresentationProps {
  onBack: () => void;
  onChangePasswordPress: () => void;
  onNotificationSettingsPress: () => void;
  onCameraSettingsPress: () => void;
  onPrivacyPress: () => void;
  onTermsPress: () => void;
  settings: SettingsViewModel;
  notificationPermission?: PermissionStatus;
  cameraPermission?: PermissionStatus;
  analyticsConsent?: boolean;
  analyticsAvailable?: boolean;
  analyticsBusy?: boolean;
  onAnalyticsConsentChange?: (value: boolean) => void;
  onDeleteAccountPress: () => void;
  onCancelDeletionPress: () => void;
  isDeletionPending?: boolean;
}

export function SettingsPresentation({
  onBack,
  onChangePasswordPress,
  onNotificationSettingsPress,
  onCameraSettingsPress,
  onPrivacyPress,
  onTermsPress,
  settings,
  notificationPermission = 'unknown',
  cameraPermission = 'unknown',
  analyticsConsent = false,
  analyticsAvailable = false,
  analyticsBusy = false,
  onAnalyticsConsentChange,
  onDeleteAccountPress,
  onCancelDeletionPress,
  isDeletionPending = false,
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
            <TouchableOpacity style={styles.row} onPress={isDeletionPending ? onCancelDeletionPress : onDeleteAccountPress}>
              <Text style={[styles.rowTitle, { color: isDeletionPending ? colors.primary : colors.danger }]}>{isDeletionPending ? 'Hủy yêu cầu xóa tài khoản' : 'Yêu cầu xóa tài khoản'}</Text>
              {!isDeletionPending && <ChevronRight size={18} color={colors.textMuted} />}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={[styles.row, styles.externalRow]} onPress={onPrivacyPress}>
              <View style={styles.rowLeft}>
                <Shield size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Dữ liệu &amp; Quyền riêng tư</Text>
              </View>
              <View style={styles.externalIndicator}><ExternalLink size={18} color={colors.textSecondary} /></View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section 2: Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn ứng dụng</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={[styles.row, styles.permissionRow]}
              onPress={onNotificationSettingsPress}
              accessibilityRole="button"
              accessibilityLabel="Thông báo trên điện thoại. Mở cài đặt ứng dụng Fitmate trên điện thoại."
            >
              <View style={styles.rowLeft}>
                <Bell size={18} color={colors.textSecondary} />
                <View style={styles.description}>
                  <Text style={styles.rowTitle}>Thông báo trên điện thoại</Text>
                  <Text style={styles.rowDescription}>Mở cài đặt điện thoại để bật hoặc tắt thông báo.</Text>
                </View>
              </View>
              <PermissionIndicator status={notificationPermission} />
            </TouchableOpacity>

            <View style={styles.divider} />
            <TouchableOpacity style={[styles.row, styles.permissionRow]} onPress={onCameraSettingsPress}
              accessibilityRole="button"
              accessibilityLabel="Quyền máy ảnh. Mở cài đặt ứng dụng Fitmate trên điện thoại.">
              <View style={styles.rowLeft}>
                <Camera size={18} color={colors.textSecondary} />
                <View style={styles.description}>
                  <Text style={styles.rowTitle}>Quyền máy ảnh</Text>
                  <Text style={styles.rowDescription}>Quản lý quyền chụp ảnh trong cài đặt điện thoại.</Text>
                </View>
              </View>
              <PermissionIndicator status={cameraPermission} />
            </TouchableOpacity>

            <View style={styles.divider} />
            <AnalyticsPreference available={analyticsAvailable} enabled={analyticsConsent}
              busy={analyticsBusy} onChange={onAnalyticsConsentChange} />

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Globe size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Ngôn ngữ hiển thị</Text>
              </View>
              <Text style={styles.rowValue}>{settings.language === 'vi' ? 'Tiếng Việt' : settings.language}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Sun size={18} color={colors.warning} />
                <Text style={styles.rowTitle}>Giao diện</Text>
              </View>
              <Text style={styles.rowValue}>Giao diện sáng</Text>
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
            <TouchableOpacity style={[styles.row, styles.externalRow]} onPress={onTermsPress}>
              <View style={styles.rowLeft}>
                <FileText size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Điều khoản dịch vụ &amp; Chính sách</Text>
              </View>
              <View style={styles.externalIndicator}><ExternalLink size={18} color={colors.textSecondary} /></View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Info size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Phiên bản</Text>
              </View>
              <Text style={styles.rowValue}>{settings.appVersion}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionRow: { position: 'relative', paddingRight: 112 },
  permissionIndicator: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 104,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xs,
  },
  permissionStatus: { fontSize: 12, fontWeight: '600', flexShrink: 1, includeFontPadding: true },
  externalRow: { position: 'relative', paddingRight: 36 },
  externalIndicator: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  description: { flex: 1, minWidth: 0, gap: spacing.xs },
  rowDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
    includeFontPadding: true,
  },
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
    minHeight: 48,
    gap: spacing.sm,
  },
  rowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    flexShrink: 1,
    includeFontPadding: true,
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
