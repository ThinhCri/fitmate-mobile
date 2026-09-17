/**
 * LoginScreen (FP-030, MOB-119).
 * Email + password. Mock auth chi chap nhan 4 default users (xem fixtures.ts).
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button, Input } from '@/components/ui';

const DEMO_USERS = [
  { email: 'user@fitmate.vn', label: 'Hội viên (Hùng)' },
  { email: 'pt@fitmate.vn', label: 'PT (Mai Xuân Tú, verified)' },
  { email: 'ptlong@fitmate.vn', label: 'PT (Trần Minh Long, pending)' },
  { email: 'minh@fitmate.vn', label: 'Hội viên (Minh)' },
  { email: 'thuhang@fitmate.vn', label: 'Mentor (Thu Hằng)' },
  { email: 'son@fitmate.vn', label: 'Mentor (Sơn)' },
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login, error, clearError } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('user@fitmate.vn');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);

  const onLogin = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập email đúng định dạng.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/dashboard');
    } catch {
      // error is in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 32, fontWeight: '800' }}>Fitmate</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14 }}>
            Đồng hành cùng bạn trên hành trình fitness
          </Text>
        </View>

        <Card variant="default">
          <Input label="Email" value={email} onChangeText={(v) => { setEmail(v); clearError(); }} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Mật khẩu" value={password} onChangeText={(v) => { setPassword(v); clearError(); }} secureTextEntry />
          {error && (
            <Text style={{ color: resolveColor(theme, 'error'), fontSize: 12, marginTop: 4 }}>{error}</Text>
          )}
        </Card>

        <Button label={submitting ? 'Đang đăng nhập...' : 'Đăng nhập'} variant="primary" fullWidth onPress={onLogin} disabled={submitting} />

        <View style={{ gap: 8 }}>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
            Đăng nhập nhanh (demo):
          </Text>
          {DEMO_USERS.map((u) => (
            <Pressable
              key={u.email}
              accessibilityRole="button"
              onPress={() => {
                setEmail(u.email);
                setPassword('123456');
              }}
            >
              <Card variant="default">
                <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '600' }}>{u.label}</Text>
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, marginTop: 2 }}>{u.email}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, textAlign: 'center' }}>
          Đây là bản demo — mật khẩu mặc định là 123456 cho mọi tài khoản mock.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
