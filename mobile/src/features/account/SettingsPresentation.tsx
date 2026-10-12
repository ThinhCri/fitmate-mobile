import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Shield,
  Bell,
  Camera,
  Globe,
  Sun,
  FileText,
  Info,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { SettingsViewModel } from './accountTypes';

export interface SettingsPresentationProps {
  onBack: () => void;
  onChangePasswordPress: () => void;
  onNotificationSettingsPress: () => void;
  onCameraSettingsPress: () => void;
  onPrivacyPress: () => void;
  onTermsPress: () => void;
  settings: SettingsViewModel;
  onNotificationsChange: (value: boolean) => void;
  onEmailAlertsChange: (value: boolean) => void;
  analyticsConsent?: boolean;
  analyticsAvailable?: boolean;
  onAnalyticsConsentChange?: (value: boolean) => void;
  onExportPress: () => void;
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
  onNotificationsChange,
  onEmailAlertsChange,
  analyticsConsent = false,
  analyticsAvailable = false,
  onAnalyticsConsentChange,
  onExportPress,
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
            <TouchableOpacity style={styles.row} onPress={onExportPress}>
              <Text style={styles.rowTitle}>Xuất dữ liệu cá nhân</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={isDeletionPending ? onCancelDeletionPress : onDeleteAccountPress}>
              <Text style={[styles.rowTitle, { color: isDeletionPending ? colors.primary : colors.danger }]}>{isDeletionPending ? 'Hủy yêu cầu xóa tài khoản' : 'Yêu cầu xóa tài khoản'}</Text>
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
            <TouchableOpacity style={styles.row} onPress={onCameraSettingsPress}>
              <View style={styles.rowLeft}>
                <Camera size={18} color={colors.textSecondary} />
                <Text style={styles.rowTitle}>Quyền máy ảnh</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Nhận thông báo</Text>
              <Switch value={settings.notificationsEnabled} onValueChange={onNotificationsChange} />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Thông báo qua email</Text>
              <Switch value={settings.emailAlertsEnabled} onValueChange={onEmailAlertsChange} />
            </View>

            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.rowTitle}>Chia sẻ thống kê sử dụng ẩn danh</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 3 }}>
                  {analyticsAvailable ? 'Giúp cải thiện app; có thể tắt bất kỳ lúc nào.' : 'Chỉ khả dụng trong bản Android đã cấu hình Analytics.'}
                </Text>
              </View>
              <Switch accessibilityLabel="Chia sẻ thống kê sử dụng ẩn danh" value={analyticsAvailable && analyticsConsent}
                disabled={!analyticsAvailable} onValueChange={onAnalyticsConsentChange} />
            </View>

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
              <Text style={styles.rowValue}>{settings.theme === 'light' ? 'Giao diện sáng' : settings.theme}</Text>
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
              <Text style={styles.rowValue}>{settings.appVersion}</Text>
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
