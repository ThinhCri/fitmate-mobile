/**
 * RegisterScreen (MOB-119, FP-030).
 * 2-step member registration or 1-step PT registration.
 * Mock auth — chi chap nhan email hop le + password.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button, Input, Chip } from '@/components/ui';

type AccountType = 'member' | 'pt';

export default function RegisterScreen() {
  const { register, error, clearError } = useAuth();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onRegister = async () => {
    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        profile: {
          avatar: null,
          name: name.trim() || 'Họ và tên',
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
          trainingDays: [],
          trainingTime: '',
          trainingTimes: [],
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
                style={({ pressed }) => ({
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: accountType === 'member' ? resolveColor(theme, 'primaryContainer') : resolveColor(theme, 'surfaceContainerLow'),
                  borderWidth: accountType === 'member' ? 2 : 1,
                  borderColor: accountType === 'member' ? resolveColor(theme, 'primary') : resolveColor(theme, 'outlineVariant'),
                })}
              >
                <Text
                  style={{
                    color: accountType === 'member' ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurface'),
                    fontSize: 14,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Hội viên
                </Text>
                <Text
                  style={{
                    color: accountType === 'member' ? resolveColor(theme, 'onPrimaryContainer') : resolveColor(theme, 'onSurfaceVariant'),
                    fontSize: 11,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                >
                  Theo dõi dinh dưỡng & tập luyện
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAccountType('pt')}
                style={({ pressed }) => ({
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: accountType === 'pt' ? resolveColor(theme, 'tertiaryContainer') : resolveColor(theme, 'surfaceContainerLow'),
                  borderWidth: accountType === 'pt' ? 2 : 1,
                  borderColor: accountType === 'pt' ? resolveColor(theme, 'tertiary') : resolveColor(theme, 'outlineVariant'),
                })}
              >
                <Text
                  style={{
                    color: accountType === 'pt' ? resolveColor(theme, 'onTertiaryContainer') : resolveColor(theme, 'onSurface'),
                    fontSize: 14,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Huấn luyện viên
                </Text>
                <Text
                  style={{
                    color: accountType === 'pt' ? resolveColor(theme, 'onTertiaryContainer') : resolveColor(theme, 'onSurfaceVariant'),
                    fontSize: 11,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                >
                  Nhận booking từ học viên
                </Text>
              </Pressable>
            </View>
            <Button
              label="Tiếp tục"
              variant="primary"
              fullWidth
              style={{ marginTop: 16 }}
              onPress={() => setStep(2)}
            />
          </Card>
        )}

        {step === 2 && (
          <Card variant="default">
            <Input label="Họ và tên" value={name} onChangeText={(v) => { setName(v); clearError(); }} placeholder="Nhập họ và tên" />
            <Input label="Email" value={email} onChangeText={(v) => { setEmail(v); clearError(); }} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Mật khẩu" value={password} onChangeText={(v) => { setPassword(v); clearError(); }} secureTextEntry />
            <Input label="Số điện thoại (tuỳ chọn)" value={phone} onChangeText={(v) => { setPhone(v); clearError(); }} keyboardType="phone-pad" />
            {error && (
              <Text style={{ color: resolveColor(theme, 'error'), fontSize: 12, marginTop: 4 }}>{error}</Text>
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
              disabled={submitting || !email || !password}
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
          <Text
            style={{ color: resolveColor(theme, 'primary'), fontWeight: '600' }}
            onPress={() => router.push('/(auth)/login')}
          >
            Đăng nhập
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
