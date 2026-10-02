/**
 * Stitch a03_ng_k_default
 * Screen: Registration
 * Route: /(auth)/register
 *
 * Production security requirements:
 * - Password policy: 12-128 characters strictly enforced
 * - PT registration NEVER sets verified certificate status
 * - Wire DTO: email, password, full_name, role ('member' | 'pt')
 * - Zero mock fallbacks on API errors
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Award,
  ShieldAlert,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 12;
const MAX_PASSWORD_LEN = 128;

type RoleType = 'member' | 'pt';

export default function RegisterScreen() {
  const { register, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleType>('member');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [pricePerSessionVnd, setPricePerSessionVnd] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: 'Chưa nhập', color: colors.textMuted };
    let score = 0;
    if (password.length >= MIN_PASSWORD_LEN) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Yếu', color: colors.danger };
      case 2:
        return { score: 2, text: 'Trung bình', color: colors.warning };
      case 3:
        return { score: 3, text: 'Khá', color: colors.info };
      case 4:
        return { score: 4, text: 'Mạnh', color: colors.success };
      default:
        return { score: 1, text: 'Yếu', color: colors.danger };
    }
  }, [password]);

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setLocalError('Vui lòng nhập họ và tên');
      return;
    }
    if (!trimmedEmail) {
      setLocalError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setLocalError('Địa chỉ email không hợp lệ');
      return;
    }
    if (password.length < MIN_PASSWORD_LEN || password.length > MAX_PASSWORD_LEN) {
      setLocalError(`Mật khẩu phải có độ dài từ ${MIN_PASSWORD_LEN} đến ${MAX_PASSWORD_LEN} ký tự theo quy định bảo mật.`);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!termsAccepted) {
      setLocalError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách riêng tư');
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    const parsedExperience = experienceYears.trim() === '' ? undefined : Number(experienceYears);
    const parsedPrice = pricePerSessionVnd.trim() === '' ? undefined : Number(pricePerSessionVnd);
    const parsedHeight = heightCm.trim() === '' ? undefined : Number(heightCm);
    const parsedWeight = weightKg.trim() === '' ? undefined : Number(weightKg);

    if (role === 'pt') {
      if (!specialty.trim()) {
        setLocalError('Vui lòng nhập chuyên môn của huấn luyện viên');
        return;
      }
      if (!Number.isInteger(parsedExperience) || parsedExperience! < 0 || parsedExperience! > 70) {
        setLocalError('Số năm kinh nghiệm phải là số nguyên từ 0 đến 70');
        return;
      }
      if (!Number.isSafeInteger(parsedPrice) || parsedPrice! < 0) {
        setLocalError('Giá mỗi buổi phải là số tiền VNĐ hợp lệ');
        return;
      }
    } else {
      if (parsedHeight !== undefined && (!Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300)) {
        setLocalError('Chiều cao phải từ 1 đến 300 cm');
        return;
      }
      if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500)) {
        setLocalError('Cân nặng phải từ 1 đến 500 kg');
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await register({
        email: trimmedEmail,
        password,
        fullName: trimmedName,
        role,
        specialty: role === 'pt' ? specialty.trim() : undefined,
        experienceYears: role === 'pt' ? parsedExperience : undefined,
        pricePerSessionVnd: role === 'pt' ? parsedPrice : undefined,
        heightCm: role === 'member' ? parsedHeight : undefined,
        weightKg: role === 'member' ? parsedWeight : undefined,
        fitnessGoal: role === 'member' ? fitnessGoal.trim() || undefined : undefined,
      });

      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: result.email },
      });
    } catch (err: any) {
      setLocalError(err?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
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
            if (currentStep === 2) {
              setCurrentStep(1);
              setLocalError(null);
              return;
            }
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
        <Text style={styles.topBarTitle}>Đăng Ký</Text>
        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Stepper Indicator */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperTrack}>
            <View style={[styles.stepperProgress, currentStep === 2 && styles.stepperProgressComplete]} />
          </View>
          <View style={styles.stepperRow}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepCircleTextActive}>{currentStep === 2 ? '✓' : '1'}</Text>
              </View>
              <Text style={styles.stepLabelActive}>Tài khoản</Text>
            </View>
            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep === 2 && styles.stepCircleActive]}>
                <Text style={currentStep === 2 ? styles.stepCircleTextActive : styles.stepCircleText}>2</Text>
              </View>
              <Text style={currentStep === 2 ? styles.stepLabelActive : styles.stepLabel}>Hồ sơ cá nhân</Text>
            </View>
          </View>
        </View>

        {/* Role Selector (Choice Chips) */}
        <View style={[styles.roleSection, currentStep !== 1 && styles.hidden]}>
          <Text style={styles.sectionTitle}>Vai trò tham gia của bạn</Text>
          <View style={styles.roleSelectorGrid}>
            {/* Option 1: Member */}
            <TouchableOpacity
              style={[
                styles.roleOptionCard,
                role === 'member' && styles.roleOptionCardActive,
              ]}
              onPress={() => setRole('member')}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: role === 'member' }}
            >
              <View style={styles.roleOptionHeader}>
                <View
                  style={[
                    styles.roleIconCircle,
                    role === 'member' && styles.roleIconCircleActive,
                  ]}
                >
                  <Dumbbell
                    size={20}
                    color={role === 'member' ? colors.white : colors.textSecondary}
                  />
                </View>
                {role === 'member' ? (
                  <CheckCircle2 size={20} color={colors.primary} />
                ) : (
                  <View style={styles.radioUnchecked} />
                )}
              </View>
              <Text style={styles.roleOptionTitle}>Hội viên</Text>
              <Text style={styles.roleOptionSubtitle}>
                Theo dõi tập luyện & dinh dưỡng khoa học
              </Text>
            </TouchableOpacity>

            {/* Option 2: PT */}
            <TouchableOpacity
              style={[
                styles.roleOptionCard,
                role === 'pt' && styles.roleOptionCardActive,
              ]}
              onPress={() => setRole('pt')}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: role === 'pt' }}
            >
              <View style={styles.roleOptionHeader}>
                <View
                  style={[
                    styles.roleIconCircle,
                    role === 'pt' && styles.roleIconCircleActive,
                  ]}
                >
                  <Award
                    size={20}
                    color={role === 'pt' ? colors.white : colors.textSecondary}
                  />
                </View>
                {role === 'pt' ? (
                  <CheckCircle2 size={20} color={colors.primary} />
                ) : (
                  <View style={styles.radioUnchecked} />
                )}
              </View>
              <Text style={styles.roleOptionTitle}>Huấn luyện viên</Text>
              <Text style={styles.roleOptionSubtitle}>
                PT quản lý lịch dạy & học viên chuyên nghiệp
              </Text>
            </TouchableOpacity>
          </View>

          {/* PT Audit Note Banner */}
          {role === 'pt' && (
            <View style={styles.ptNoticeBanner}>
              <ShieldAlert size={20} color={colors.warning} style={{ marginTop: 2, flexShrink: 0 }} />
              <Text style={styles.ptNoticeText}>
                Sau khi xác minh email, HLV cần tải chứng chỉ trong Không gian PT và chờ xét duyệt trước khi hiển thị dịch vụ.
              </Text>
            </View>
          )}
        </View>

        {/* Error Alert Banner */}
        {displayedError ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={18} color={colors.danger} style={{ marginTop: 2 }} />
            <Text style={styles.errorBannerText}>{displayedError}</Text>
          </View>
        ) : null}

        {/* Registration Form */}
        <View style={[styles.form, currentStep !== 1 && styles.hidden]}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Họ và tên <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  setLocalError(null);
                  clearError();
                }}
                placeholder="Nguyễn Văn An"
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
                editable={!submitting}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Địa chỉ Email <Text style={styles.requiredAsterisk}>*</Text>
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
                placeholder="minhanh.fit@gmail.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!submitting}
              />
            </View>
          </View>

          {/* Password */}
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
                placeholder="Tối thiểu 12 ký tự"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
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

            {/* Password Strength Meter */}
            <View style={styles.strengthMeterContainer}>
              <View style={styles.strengthMeterHeader}>
                <Text style={styles.strengthMeterLabel}>Độ an toàn mật khẩu</Text>
                <Text style={[styles.strengthMeterValue, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
              <View style={styles.strengthBarsRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      passwordStrength.score >= i && { backgroundColor: passwordStrength.color },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.strengthPolicyHint}>
                Quy định bảo mật Fitmate: Tối thiểu 12 ký tự, bao gồm cả chữ cái và số.
              </Text>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Xác nhận mật khẩu <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textMuted} style={styles.inputLeftIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setLocalError(null);
                  clearError();
                }}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
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
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <Text style={styles.passwordMismatchText}>Mật khẩu xác nhận không khớp</Text>
            )}
          </View>

          {/* Terms and Privacy Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setTermsAccepted((prev) => !prev)}
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Check size={14} color={colors.white} strokeWidth={3} />}
            </View>
            <Text style={styles.checkboxLabel}>
              Tôi đã đọc và đồng ý với{' '}
              <Text style={styles.legalLink}>Điều khoản dịch vụ</Text> và{' '}
              <Text style={styles.legalLink}>Chính sách riêng tư</Text> của Fitmate.
            </Text>
          </TouchableOpacity>

          {/* Primary CTA Button (52dp) */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Tiếp tục tạo tài khoản"
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Tiếp tục tạo tài khoản</Text>
                <ArrowRight size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {currentStep === 2 && (
          <View style={styles.form}>
            <View style={styles.profileStepHeader}>
              <Text style={styles.profileStepTitle}>{role === 'pt' ? 'Thông tin nghề nghiệp PT' : 'Hồ sơ sức khỏe cơ bản'}</Text>
              <Text style={styles.profileStepSubtitle}>{role === 'pt' ? 'Các trường dưới đây là bắt buộc để tạo hồ sơ huấn luyện viên.' : 'Bạn có thể bổ sung các thông tin này ngay bây giờ hoặc cập nhật sau.'}</Text>
            </View>

            {role === 'pt' ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Chuyên môn <Text style={styles.requiredAsterisk}>*</Text></Text>
                  <View style={styles.inputWrapper}><TextInput style={styles.input} value={specialty} onChangeText={(value) => { setSpecialty(value); setLocalError(null); }} placeholder="Ví dụ: Tăng cơ, giảm mỡ" placeholderTextColor={colors.textMuted} maxLength={200} /></View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Số năm kinh nghiệm <Text style={styles.requiredAsterisk}>*</Text></Text>
                  <View style={styles.inputWrapper}><TextInput style={styles.input} value={experienceYears} onChangeText={(value) => { setExperienceYears(value.replace(/[^0-9]/g, '')); setLocalError(null); }} placeholder="Ví dụ: 3" placeholderTextColor={colors.textMuted} keyboardType="number-pad" maxLength={2} /></View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Giá mỗi buổi (VNĐ) <Text style={styles.requiredAsterisk}>*</Text></Text>
                  <View style={styles.inputWrapper}><TextInput style={styles.input} value={pricePerSessionVnd} onChangeText={(value) => { setPricePerSessionVnd(value.replace(/[^0-9]/g, '')); setLocalError(null); }} placeholder="Ví dụ: 300000" placeholderTextColor={colors.textMuted} keyboardType="number-pad" maxLength={12} /></View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Chiều cao (cm)</Text>
                  <View style={styles.inputWrapper}><TextInput style={styles.input} value={heightCm} onChangeText={(value) => setHeightCm(value.replace(/[^0-9.]/g, ''))} placeholder="Ví dụ: 170" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" /></View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Cân nặng (kg)</Text>
                  <View style={styles.inputWrapper}><TextInput style={styles.input} value={weightKg} onChangeText={(value) => setWeightKg(value.replace(/[^0-9.]/g, ''))} placeholder="Ví dụ: 65" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" /></View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Mục tiêu tập luyện</Text>
                  <View style={styles.inputWrapper}><TextInput style={styles.input} value={fitnessGoal} onChangeText={setFitnessGoal} placeholder="Ví dụ: Tăng cơ và cải thiện sức bền" placeholderTextColor={colors.textMuted} /></View>
                </View>
              </>
            )}

            <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} activeOpacity={0.85} onPress={handleSubmit} disabled={submitting} accessibilityRole="button" accessibilityLabel="Hoàn tất đăng ký">
              {submitting ? <ActivityIndicator color={colors.white} size="small" /> : <><Text style={styles.submitButtonText}>Hoàn tất đăng ký</Text><ArrowRight size={20} color={colors.white} /></>}
            </TouchableOpacity>
          </View>
        )}

        {/* Login Link Alternative */}
        <View style={styles.loginRow}>
          <Text style={styles.loginRowPrompt}>Đã có tài khoản?</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập"
          >
            <Text style={styles.loginRowLink}>Đăng nhập</Text>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepperCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  stepperTrack: {
    position: 'absolute',
    top: 28,
    left: 48,
    right: 48,
    height: 3,
    backgroundColor: colors.borderSubtle,
    borderRadius: radius.full,
  },
  stepperProgress: {
    width: '50%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  stepperProgressComplete: {
    width: '100%',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleText: {
    ...typography.captionMedium,
    color: colors.textMuted,
  },
  stepCircleTextActive: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepLabelActive: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  roleSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  roleSelectorGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleOptionCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconCircleActive: {
    backgroundColor: colors.primary,
  },
  radioUnchecked: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  roleOptionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  roleOptionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  ptNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  ptNoticeText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
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
  hidden: {
    display: 'none',
  },
  profileStepHeader: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  profileStepTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  profileStepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
  strengthMeterContainer: {
    marginTop: spacing.xs,
    gap: 4,
  },
  strengthMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthMeterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  strengthMeterValue: {
    ...typography.captionMedium,
    fontWeight: '700',
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderSubtle,
    borderRadius: radius.full,
  },
  strengthPolicyHint: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  passwordMismatchText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: '600',
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
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xl,
  },
  loginRowPrompt: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginRowLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
