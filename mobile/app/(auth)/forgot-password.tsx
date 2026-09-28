/**
 * Stitch a05_qu_n_m_t_kh_u_reset_flow
 * Screen: Forgot & Reset Password
 * Route: /(auth)/forgot-password
 *
 * Implements:
 * 1. POST /auth/password/forgot (forgotPassword)
 * 2. POST /auth/password/reset (resetPassword with token & 12-128 char password)
 * 3. Zero mock fallbacks on API errors
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react-native';
import { authService } from '@/services/api/authService';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 12;
const MAX_PASSWORD_LEN = 128;

type ResetViewTab = 'request' | 'reset';

export default function ForgotPasswordScreen() {
  const [activeTab, setActiveTab] = useState<ResetViewTab>('request');

  // Request Tab State
  const [email, setEmail] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Reset Tab State
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSendResetRequest = async () => {
    setRequestError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setRequestError('Vui lòng nhập địa chỉ email tài khoản');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setRequestError('Địa chỉ email không đúng định dạng');
      return;
    }

    setSendingRequest(true);
    try {
      await authService.forgotPassword({ email: trimmedEmail });
      setRequestSent(true);
    } catch (err: any) {
      setRequestError(err?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleResetPassword = async () => {
    setResetError(null);
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setResetError('Vui lòng nhập mã token đặt lại mật khẩu');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LEN || newPassword.length > MAX_PASSWORD_LEN) {
      setResetError(`Mật khẩu mới phải có độ dài từ ${MIN_PASSWORD_LEN} đến ${MAX_PASSWORD_LEN} ký tự.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Mật khẩu xác nhận không khớp');
      return;
    }

    setResettingPassword(true);
    try {
      await authService.resetPassword({
        token: trimmedToken,
        new_password: newPassword,
      });

      Alert.alert(
        'Thành công',
        'Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
        [
          {
            text: 'Đăng nhập ngay',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (err: any) {
      setResetError(err?.message || 'Không thể đặt lại mật khẩu. Mã token có thể đã hết hạn hoặc không hợp lệ.');
    } finally {
      setResettingPassword(false);
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
        <Text style={styles.topBarTitle}>Quên Mật Khẩu</Text>
        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step Indicator Pill */}
        <View style={styles.stepPill}>
          <View style={styles.stepPillDot} />
          <Text style={styles.stepPillText}>Bảo mật xác thực tài khoản</Text>
        </View>

        {/* Visual Anchor / Decorative Illustration Card */}
        <View style={styles.anchorCard}>
          <View style={styles.anchorIconWrapper}>
            <KeyRound size={26} color={colors.primary} />
          </View>
          <View style={styles.anchorTexts}>
            <Text style={styles.anchorTitle}>Khôi phục quyền truy cập</Text>
            <Text style={styles.anchorSubtitle}>
              Nhập địa chỉ email liên kết với tài khoản Fitmate của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu an toàn.
            </Text>
          </View>
        </View>

        {/* Mode Switcher Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'request' && styles.tabButtonActive]}
            onPress={() => setActiveTab('request')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'request' }}
          >
            <Text style={[styles.tabText, activeTab === 'request' && styles.tabTextActive]}>
              Gửi mã phục hồi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'reset' && styles.tabButtonActive]}
            onPress={() => setActiveTab('reset')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'reset' }}
          >
            <Text style={[styles.tabText, activeTab === 'reset' && styles.tabTextActive]}>
              Nhập mật khẩu mới
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: REQUEST RESET LINK */}
        {activeTab === 'request' && (
          <View style={styles.sectionContainer}>
            {requestError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color={colors.danger} style={{ marginTop: 2 }} />
                <Text style={styles.errorBannerText}>{requestError}</Text>
              </View>
            ) : null}

            {requestSent ? (
              <View style={styles.successCard}>
                <CheckCircle2 size={24} color={colors.success} style={{ marginTop: 2 }} />
                <View style={styles.successTexts}>
                  <Text style={styles.successTitle}>Đã gửi yêu cầu đặt lại!</Text>
                  <Text style={styles.successSubtitle}>
                    Nếu email <Text style={{ fontWeight: '700' }}>{email.trim()}</Text> tồn tại trong hệ thống, bạn sẽ nhận được mã bảo mật trong ít phút.
                  </Text>
                  <TouchableOpacity
                    style={styles.goToResetTabBtn}
                    onPress={() => setActiveTab('reset')}
                  >
                    <Text style={styles.goToResetTabText}>Nhập mã xác thực vừa nhận →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.formCard}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email tài khoản</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setRequestError(null);
                      }}
                      placeholder="tenban@example.com"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      editable={!sendingRequest}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, sendingRequest && styles.actionButtonDisabled]}
                  activeOpacity={0.85}
                  onPress={handleSendResetRequest}
                  disabled={sendingRequest}
                  accessibilityRole="button"
                  accessibilityLabel="Gửi hướng dẫn đặt lại"
                >
                  {sendingRequest ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <>
                      <Send size={18} color={colors.white} />
                      <Text style={styles.actionButtonText}>Gửi hướng dẫn đặt lại</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Security Notice Card */}
            <View style={styles.securityNoticeCard}>
              <View style={styles.securityIconCircle}>
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <View style={styles.securityTexts}>
                <View style={styles.securityBadgeRow}>
                  <Text style={styles.securityTitle}>Chính sách bảo mật Fitmate</Text>
                  <View style={styles.e2eBadge}>
                    <Text style={styles.e2eBadgeText}>Mã hoá E2E</Text>
                  </View>
                </View>
                <Text style={styles.securityDesc}>
                  Nếu email tồn tại trong hệ thống, bạn sẽ nhận được đường dẫn đặt lại mật khẩu trong ít phút. Vì lý do an toàn, Fitmate không tiết lộ thông tin tài khoản có tồn tại hay không.
                </Text>
              </View>
            </View>

            {/* Tips Card */}
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <HelpCircle size={16} color={colors.warning} />
                <Text style={styles.tipTitle}>Không nhận được thư?</Text>
              </View>
              <Text style={styles.tipDesc}>
                Hãy kiểm tra mục Thư rác (Spam) hoặc Quảng cáo. Đường dẫn và mã bảo mật sẽ hết hiệu lực sau 15 phút.
              </Text>
            </View>
          </View>
        )}

        {/* TAB 2: RESET WITH TOKEN FORM */}
        {activeTab === 'reset' && (
          <View style={styles.sectionContainer}>
            {resetError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color={colors.danger} style={{ marginTop: 2 }} />
                <Text style={styles.errorBannerText}>{resetError}</Text>
              </View>
            ) : null}

            <View style={styles.formCard}>
              {/* Token Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Mã xác thực (Token) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <KeyRound size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
                  <TextInput
                    style={styles.input}
                    value={token}
                    onChangeText={(val) => {
                      setToken(val);
                      setResetError(null);
                    }}
                    placeholder="Dán mã bảo mật từ email"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!resettingPassword}
                  />
                </View>
              </View>

              {/* New Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Mật khẩu mới (Tối thiểu 12 ký tự) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 44 }]}
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
                      setResetError(null);
                    }}
                    placeholder="Nhập mật khẩu mới"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!resettingPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Xác nhận mật khẩu mới <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 44 }]}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      setResetError(null);
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!resettingPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                  <Text style={styles.passwordMismatchText}>Mật khẩu xác nhận không khớp</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.actionButton, resettingPassword && styles.actionButtonDisabled]}
                activeOpacity={0.85}
                onPress={handleResetPassword}
                disabled={resettingPassword}
                accessibilityRole="button"
                accessibilityLabel="Cập nhật mật khẩu mới"
              >
                {resettingPassword ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <ShieldCheck size={18} color={colors.white} />
                    <Text style={styles.actionButtonText}>Cập nhật mật khẩu mới</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  stepPillDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  stepPillText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  anchorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  anchorIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorTexts: {
    flex: 1,
  },
  anchorTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  anchorSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: spacing.md,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  requiredAsterisk: {
    color: colors.danger,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    height: 48,
    paddingHorizontal: spacing.md,
  },
  inputLeftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordMismatchText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 2,
  },
  actionButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
    fontWeight: '500',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successTexts: {
    flex: 1,
  },
  successTitle: {
    ...typography.bodyBold,
    color: colors.success,
    fontSize: 15,
  },
  successSubtitle: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 18,
  },
  goToResetTabBtn: {
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  goToResetTabText: {
    ...typography.captionMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  securityNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  securityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTexts: {
    flex: 1,
  },
  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  securityTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  e2eBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  e2eBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  securityDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipTitle: {
    ...typography.captionMedium,
    color: colors.warning,
    fontWeight: '700',
  },
  tipDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
