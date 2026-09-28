/**
 * Stitch a04_x_c_minh_email_email_link_state
 * Screen: Email Verification Notice
 * Route: /(auth)/verify-email
 *
 * Requirements:
 * - Honest user copy: informs user that email verification is currently not available,
 *   allowing immediate login if the account was registered.
 * - Masked email presentation (e.g. t***@domain.com).
 * - Safe email client launcher with fallback alert if no mail app is installed.
 * - Zero developer jargon (no 'OpenAPI', 'CONTRACT_GAP', or invented sender names).
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  MailCheck,
  CheckCircle2,
  Info,
  ExternalLink,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 't***@fitmate.vn';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export default function VerifyEmailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const rawEmail = (params.email as string) || user?.email || '';
  const maskedEmail = maskEmail(rawEmail);

  const handleOpenEmailApp = async () => {
    try {
      const canOpen = await Linking.canOpenURL('mailto:');
      if (canOpen) {
        await Linking.openURL('mailto:');
      } else {
        Alert.alert(
          'Không thể mở ứng dụng Email',
          'Thiết bị chưa thiết lập ứng dụng quản lý hòm thư mặc định.'
        );
      }
    } catch {
      Alert.alert(
        'Không thể mở ứng dụng Email',
        'Thiết bị chưa thiết lập ứng dụng quản lý hòm thư mặc định.'
      );
    }
  };

  return (
    <ScreenContainer backgroundColor={colors.background}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/login');
            }
          }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Xác Minh Email</Text>
        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual Graphic */}
        <View style={styles.visualContainer}>
          <View style={styles.pulseOuterGlow}>
            <View style={styles.pulseInnerGlow}>
              <View style={styles.envelopeCard}>
                <MailCheck size={42} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>

        {/* Main Information Block */}
        <View style={styles.infoCluster}>
          <Text style={styles.mainTitle}>Thông tin xác minh email</Text>
          <Text style={styles.mainSubtitle}>
            Tính năng xác minh email hiện chưa khả dụng. Bạn có thể tiếp tục đăng nhập nếu tài khoản đã được tạo.
          </Text>

          {rawEmail ? (
            <View style={styles.emailPill}>
              <Mail size={16} color={colors.primary} />
              <Text style={styles.emailPillText}>{maskedEmail}</Text>
            </View>
          ) : null}
        </View>

        {/* Helpful Guidance Card */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsCardHeader}>
            <Info size={18} color={colors.primary} />
            <Text style={styles.stepsCardTitle}>Hướng dẫn đăng nhập</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.stepDesc}>
              Nhấn nút <Text style={styles.boldText}>&quot;Tiếp tục Đăng nhập&quot;</Text> phía dưới.
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.stepDesc}>
              Nhập email và mật khẩu (từ 12–128 ký tự) đã đăng ký.
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.stepDesc}>
              Hệ thống sẽ tự động chuyển vào không gian luyện tập tương ứng của bạn.
            </Text>
          </View>
        </View>

        {/* Friendly Notice */}
        <View style={styles.friendlyNotice}>
          <CheckCircle2 size={18} color={colors.success} style={{ marginTop: 2, flexShrink: 0 }} />
          <Text style={styles.friendlyNoticeText}>
            Tài khoản của bạn đã được lưu an toàn trên hệ thống máy chủ Fitmate.
          </Text>
        </View>

        {/* Action Stack */}
        <View style={styles.actionStack}>
          {/* Primary Action: Go to Login */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Tiếp tục Đăng nhập"
          >
            <Text style={styles.loginButtonText}>Tiếp tục Đăng nhập</Text>
            <ArrowRight size={20} color={colors.white} />
          </TouchableOpacity>

          {/* Secondary Action: Check mail app */}
          <TouchableOpacity
            style={styles.openMailButton}
            activeOpacity={0.85}
            onPress={handleOpenEmailApp}
            accessibilityRole="button"
            accessibilityLabel="Mở ứng dụng Email"
          >
            <ExternalLink size={18} color={colors.primary} />
            <Text style={styles.openMailButtonText}>Mở ứng dụng Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  topBarTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  topBarRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  pulseOuterGlow: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInnerGlow: {
    width: 90,
    height: 90,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelopeCard: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoCluster: {
    alignItems: 'center',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  mainTitle: {
    ...typography.title1,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  mainSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  emailPillText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepsCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  stepsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  stepsCardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  friendlyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  friendlyNoticeText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionStack: {
    gap: spacing.md,
  },
  loginButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  openMailButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  openMailButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 16,
  },
});
