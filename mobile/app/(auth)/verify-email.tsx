/**
 * Stitch a04_x_c_minh_email_email_link_state
 * Screen: Email Verification / Link State
 * Route: /(auth)/verify-email
 *
 * Contract Note:
 * Endpoint xác minh OTP chưa có trong OpenAPI fitmate-v1.yaml (CONTRACT_GAP).
 * Màn hình hiển thị liên kết mở client hòm thư và hướng dẫn kích hoạt an toàn.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  MailCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';

export default function VerifyEmailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const targetEmail = (params.email as string) || user?.email || 'ban@fitmate.vn';

  const handleOpenEmailApp = async () => {
    try {
      await Linking.openURL('mailto:');
    } catch {
      // Ignored if device has no default mail app configured
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
        {/* Pulsing Verified Mail Envelope Visual */}
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
          <Text style={styles.mainTitle}>Kiểm tra hộp thư của bạn</Text>
          <Text style={styles.mainSubtitle}>
            Chúng tôi đã gửi một đường dẫn xác minh tài khoản đến địa chỉ email:
          </Text>
          <View style={styles.emailPill}>
            <Mail size={16} color={colors.primary} />
            <Text style={styles.emailPillText}>{targetEmail}</Text>
          </View>
          <Text style={styles.instructionNote}>
            Vui lòng nhấn vào liên kết trong email để kích hoạt tài khoản của bạn.
          </Text>
        </View>

        {/* Step-by-Step Instruction Card */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsCardHeader}>
            <CheckCircle2 size={18} color={colors.primary} />
            <Text style={styles.stepsCardTitle}>3 bước kích hoạt nhanh</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.stepDesc}>Mở ứng dụng email trên điện thoại của bạn.</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.stepDesc}>
              Tìm thư từ <Text style={styles.boldText}>Fitmate Security Team</Text>.
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.stepDesc}>
              Nhấn vào nút <Text style={styles.boldText}>&quot;Xác nhận địa chỉ email&quot;</Text> để hoàn tất.
            </Text>
          </View>
        </View>

        {/* Friendly Notice / Spam Warning Banner */}
        <View style={styles.spamNotice}>
          <AlertTriangle size={18} color={colors.warning} style={{ marginTop: 2, flexShrink: 0 }} />
          <Text style={styles.spamNoticeText}>
            Nếu không thấy email trong <Text style={styles.boldText}>Hộp thư đến</Text>, vui lòng kiểm tra thư mục{' '}
            <Text style={styles.boldText}>Spam</Text> hoặc <Text style={styles.boldText}>Thư rác</Text>.
          </Text>
        </View>

        {/* Contract Gap Transparent Notice */}
        <View style={styles.contractGapCard}>
          <Info size={16} color={colors.info} style={{ marginTop: 2, flexShrink: 0 }} />
          <Text style={styles.contractGapText}>
            Lưu ý hệ thống: Hiện tại Backend OpenAPI chưa cung cấp endpoint xác thực OTP qua API. Luồng kích hoạt thực tế thực hiện qua liên kết an toàn gửi trực tiếp đến hòm thư.
          </Text>
        </View>

        {/* Primary Interactive Action: Open Email App Client (52dp) */}
        <View style={styles.actionStack}>
          <TouchableOpacity
            style={styles.openMailButton}
            activeOpacity={0.85}
            onPress={handleOpenEmailApp}
            accessibilityRole="button"
            accessibilityLabel="Mở ứng dụng Email"
          >
            <ExternalLink size={20} color={colors.white} />
            <Text style={styles.openMailButtonText}>Mở ứng dụng Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            activeOpacity={0.85}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Quay lại Đăng nhập"
          >
            <ArrowLeft size={18} color={colors.primary} />
            <Text style={styles.backToLoginButtonText}>Quay lại Đăng nhập</Text>
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
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emailPillText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  instructionNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
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
  spamNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  spamNoticeText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  contractGapCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  contractGapText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.info,
    flex: 1,
    lineHeight: 16,
  },
  actionStack: {
    gap: spacing.md,
  },
  openMailButton: {
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
  openMailButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  backToLoginButton: {
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
  backToLoginButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 16,
  },
});
