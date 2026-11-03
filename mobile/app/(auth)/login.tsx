/**
 * Stitch a02_ng_nh_p_default
 * Screen: Authentication Login
 * Route: /(auth)/login
 *
 * Production security requirements:
 * - Zero DEMO_USERS / zero mock login shortcuts
 * - Zero hardcoded passwords ('123456')
 * - Zero plaintext password persistence
 * - Zero mock success / fallback on API errors
 * - Memory-only access token via SessionManager
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { authService } from '@/services/api/authService';
import { ApiError } from '@/services/api/client';
import { AuthIntro } from '@/features/auth/AuthIntro';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login, error, clearError } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || '');
  const passwordRef = useRef<TextInput>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const emailParts = email.trim().split('@');
  const emailSuggestions = emailFocused && emailParts.length <= 2 && emailParts[0] && !/\s/.test(email)
    ? ['gmail.com', 'outlook.com', 'yahoo.com'].filter(domain => domain.startsWith(emailParts[1] || '') && domain !== emailParts[1]).map(domain => `${emailParts[0]}@${domain}`) : [];
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setLocalError('Địa chỉ email không hợp lệ');
      return;
    }
    if (!password) {
      setLocalError('Vui lòng nhập mật khẩu');
      return;
    }

    setSubmitting(true);
    try {
      const authenticatedUser = await login(trimmedEmail, password);
      if (authenticatedUser.role === 'pt' && authenticatedUser.ptVerificationStatus !== 'approved') {
        router.replace('/pt/certificates');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: unknown) {
      const problem = err instanceof ApiError && typeof err.data === 'object' && err.data !== null
        ? err.data as { code?: string }
        : undefined;
      if (problem?.code === 'FITMATE.AUTH.EMAIL_NOT_VERIFIED') {
        clearError();
        try {
          await authService.resendEmailVerification(trimmedEmail);
        } catch {
          // The OTP screen still provides an explicit resend action.
        }
        router.replace({ pathname: '/(auth)/verify-email', params: { email: trimmedEmail } });
        return;
      }
      setLocalError(err instanceof Error ? err.message : 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedError = localError || error;

  return (
    <ScreenContainer backgroundColor={colors.background}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/welcome' as any);
            }
          }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Đăng Nhập</Text>
        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <AuthIntro title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục hành trình của bạn." />

        {/* Error Alert Banner */}
        {displayedError ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={18} color={colors.danger} style={{ marginTop: 2 }} />
            <Text style={styles.errorBannerText}>{displayedError}</Text>
          </View>
        ) : null}

        {/* Sign In Form */}
        <View style={styles.form}>
          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Email tài khoản <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setLocalError(null);
                  clearError();
                }}
                placeholder="nguyen.van.an@fitmate.vn"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="username"
                importantForAutofill="yes"
                accessibilityLabel="Email tài khoản"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCorrect={false}
                editable={!submitting}
              />
            </View>
          </View>

          {emailSuggestions.length > 0 && <View style={{ gap: 6 }}>
            <Text style={typography.caption}>Gợi ý địa chỉ email</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {emailSuggestions.map(value => <TouchableOpacity key={value} accessibilityRole="button" accessibilityLabel={'Điền email ' + value} disabled={submitting} onPress={() => { setEmail(value); setLocalError(null); clearError(); passwordRef.current?.focus(); }} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.primary }}>{'@' + value.split('@')[1]}</Text></TouchableOpacity>)}
            </View>
          </View>}
          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Mật khẩu <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setLocalError(null);
                  clearError();
                }}
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor={colors.textMuted}
                ref={passwordRef}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                importantForAutofill="yes"
                accessibilityLabel="Mật khẩu"
                returnKeyType="go"
                onSubmitEditing={() => { if (!submitting) void handleLogin(); }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
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

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password' as any)}
              accessibilityRole="button"
              accessibilityLabel="Quên mật khẩu"
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Primary CTA Button (52dp) */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập"
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Đăng nhập</Text>
                <ArrowRight size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Navigation Link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerRowPrompt}>Chưa có tài khoản?</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            accessibilityRole="button"
            accessibilityLabel="Đăng ký ngay"
          >
            <Text style={styles.registerRowLink}>Đăng ký ngay</Text>
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
  headerVisualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerVisualTexts: {
    flex: 1,
  },
  headerVisualTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
  },
  headerVisualSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  infoBannerIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  infoBannerText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  boldPrimary: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
    fontWeight: '500',
  },
  form: {
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
  forgotPasswordRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    ...typography.captionMedium,
    color: colors.primary,
    paddingVertical: 4,
  },
  submitButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  roleCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleCardTitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  systemBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  systemBadgeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  roleCardGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleSubCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  roleSubIconCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSubTexts: {
    flex: 1,
  },
  roleSubTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  roleSubDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xl,
  },
  registerRowPrompt: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerRowLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
