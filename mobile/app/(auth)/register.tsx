/**
 * RegisterScreen (MOB-119, FP-030).
 * Member: 2-step (accountType -> form + chon ngay tap).
 * PT: 1-step (accountType -> form day du).
 * Validation: email format + password >= MIN_PASSWORD_LEN.
 *
 * MIN_PASSWORD_LEN phải khớp BE `Fitmate.Domain.Common.PasswordPolicy.MinimumLength`
 * (chốt 2026-09-28 = 12). Trước đó để 6, thấp hơn cả validator cũ của BE (8).
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button, Input, Chip } from '@/components/ui';

type AccountType = 'member' | 'pt';
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 12;

export default function RegisterScreen() {
  const { register, error, clearError } = useAuth();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trainingDays, setTrainingDays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const toggleDay = (d: string) => {
    setTrainingDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const validateStep2 = (): string | null => {
    if (!name.trim()) return 'Vui lòng nhập họ và tên.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Email không hợp lệ.';
    if (password.length < MIN_PASSWORD_LEN) return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LEN} ký tự.`;
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp.';
    if (accountType === 'member' && trainingDays.length === 0) return 'Vui lòng chọn ít nhất 1 ngày tập.';
    return null;
  };

  const onRegister = async () => {
    setLocalError(null);
    const err = validateStep2();
    if (err) {
      setLocalError(err);
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        profile: {
          avatar: null,
          name: name.trim(),
          bio: '',
          goal: '',
          phone,
          birthday: '',
          gender: 'Nam',
          height: 170,
          weight: 65,
          medicalCondition: '',
          allergies: [],
          allergySurveyDone: false,
          trainingDays: accountType === 'member' ? trainingDays : ['T2', 'T3', 'T4', 'T5', 'T6'],
          trainingTime: accountType === 'member' ? '18:00 - 20:00' : '08:00 - 21:00',
          trainingTimes: accountType === 'member' ? ['18:00', '19:00'] : ['08:00', '10:00', '14:00', '16:00'],
          spec: accountType === 'pt' ? ['General Fitness'] : [],
          exp: accountType === 'pt' ? 0 : 0,
          price: accountType === 'pt' ? 200000 : 0,
          isVerified: false,
          certificateStatus: 'unverified',
          certificates: [],
          isPt: accountType === 'pt',
          isSelf: true,
        },
      });
      router.replace('/(tabs)/dashboard');
    } catch {
      // error in context
    } finally {
      setSubmitting(false);
    }
  };

  const showError = localError ?? error;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 28, fontWeight: '800' }}>Đăng ký</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>
            Tạo tài khoản Fitmate
          </Text>
        </View>

        {step === 1 && (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', marginBottom: 12 }}>
              Bạn là?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAccountType('member')}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: accountType === 'member' ? resolveColor(theme, 'primaryContainer') : resolveColor(theme, 'surfaceContainerLow'),
                  borderWidth: accountType === 'member' ? 2 : 1,
                  borderColor: accountType === 'member' ? resolveColor(theme, 'primary') : resolveColor(theme, 'outlineVariant'),
                }}
              >
                <Text style={{ color: accountType === 'member' ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
                  Hội viên
                </Text>
                <Text style={{ color: accountType === 'member' ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  Theo dõi dinh dưỡng & tập luyện
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAccountType('pt')}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: accountType === 'pt' ? resolveColor(theme, 'tertiaryContainer') : resolveColor(theme, 'surfaceContainerLow'),
                  borderWidth: accountType === 'pt' ? 2 : 1,
                  borderColor: accountType === 'pt' ? resolveColor(theme, 'tertiary') : resolveColor(theme, 'outlineVariant'),
                }}
              >
                <Text style={{ color: accountType === 'pt' ? resolveColor(theme, 'onTertiaryContainer') : resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
                  Huấn luyện viên
                </Text>
                <Text style={{ color: accountType === 'pt' ? resolveColor(theme, 'onTertiaryContainer') : resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  Nhận booking từ học viên
                </Text>
              </Pressable>
            </View>
            <Button label="Tiếp tục" variant="primary" fullWidth onPress={() => setStep(2)} />
          </Card>
        )}

        {step === 2 && (
          <Card variant="default">
            <Input label="Họ và tên" value={name} onChangeText={(v) => { setName(v); clearError(); setLocalError(null); }} placeholder="Nhập họ và tên" />
            <Input label="Email" value={email} onChangeText={(v) => { setEmail(v); clearError(); setLocalError(null); }} keyboardType="email-address" autoCapitalize="none" placeholder="example@fitmate.vn" />
            <Input label={`Mật khẩu (tối thiểu ${MIN_PASSWORD_LEN} ký tự)`} value={password} onChangeText={(v) => { setPassword(v); clearError(); setLocalError(null); }} secureTextEntry placeholder="******" />
            <Input label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={(v) => { setConfirmPassword(v); clearError(); setLocalError(null); }} secureTextEntry placeholder="Nhập lại mật khẩu" />
            <Input label="Số điện thoại (tuỳ chọn)" value={phone} onChangeText={(v) => { setPhone(v); clearError(); setLocalError(null); }} keyboardType="phone-pad" />
            {accountType === 'member' && (
              <>
                <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '700', marginTop: 12 }}>Ngày tập trong tuần</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {DAYS.map((d) => (
                    <Chip key={d} label={d} selected={trainingDays.includes(d)} onPress={() => toggleDay(d)} />
                  ))}
                </View>
              </>
            )}
            {showError && (
              <Text style={{ color: resolveColor(theme, 'error'), fontSize: 12, marginTop: 8 }}>{showError}</Text>
            )}
          </Card>
        )}

        {step === 2 && (
          <View style={{ gap: 8 }}>
            <Button
              label={submitting ? 'Đang đăng ký...' : `Đăng ký${accountType === 'pt' ? ' HLV' : ' Hội viên'}`}
              variant="primary"
              fullWidth
              onPress={onRegister}
              disabled={submitting}
            />
            <Button
              label="Quay lại"
              variant="tertiary"
              fullWidth
              onPress={() => setStep(1)}
            />
          </View>
        )}

        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, textAlign: 'center' }}>
          Đã có tài khoản?{' '}
          <Text style={{ color: resolveColor(theme, 'primary'), fontWeight: '600' }} onPress={() => router.push('/(auth)/login')}>
            Đăng nhập
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
