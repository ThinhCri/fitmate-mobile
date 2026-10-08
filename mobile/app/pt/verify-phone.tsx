import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { authService } from '@/services/api/authService';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export default function VerifyPtPhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    authService.getMe().then((profile) => {
      if (!active) return;
      setPhone(profile.phone || '');
      setVerified(profile.phone_verified === true);
    }).catch(() => { if (active) setMessage('Không thể tải trạng thái số điện thoại. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const requestCode = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await authService.requestPtPhoneCode(phone.trim());
      setSentTo(phone.trim());
      setMessage('Mã xác minh đã được yêu cầu. Kiểm tra SMS và nhập mã trong 5 phút.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể gửi mã xác minh.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await authService.confirmPtPhoneCode(code.trim());
      Alert.alert('Đã xác minh', 'Số điện thoại PT đã được xác minh.', [
        { text: 'Tiếp tục', onPress: () => router.replace('/pt/certificates') },
      ]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Mã không đúng hoặc đã hết hạn.');
    } finally {
      setBusy(false);
    }
  };

  return <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}><Text style={styles.backText}>‹ Quay lại</Text></Pressable>
      <Text style={styles.title}>Xác minh số điện thoại</Text>
      <Text style={styles.description}>Để Admin duyệt hồ sơ PT, bạn cần chứng minh mình sở hữu số điện thoại này. Mã SMS chỉ dùng một lần.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : verified ?
        <Text style={styles.success}>Số điện thoại của bạn đã được xác minh.</Text> : <>
          <Text style={styles.label}>Số điện thoại (+84)</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+84901234567" style={styles.input} editable={!busy} accessibilityLabel="Số điện thoại PT" />
          <Pressable onPress={() => void requestCode()} disabled={busy} style={styles.button} accessibilityRole="button"><Text style={styles.buttonText}>Gửi mã SMS</Text></Pressable>
          <Text style={styles.label}>Mã xác minh 6 chữ số</Text>
          <TextInput value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="sms-otp" maxLength={6} placeholder="Nhập mã OTP" style={styles.input} editable={!busy} accessibilityLabel="Mã xác minh SMS" />
          {sentTo ? <Text style={styles.hint}>Mã đã yêu cầu cho {sentTo}. Muốn dùng số khác, hãy gửi mã mới.</Text> : null}
          <Pressable onPress={() => void confirmCode()} disabled={busy || code.length !== 6} style={[styles.button, (busy || code.length !== 6) && styles.disabled]} accessibilityRole="button"><Text style={styles.buttonText}>Xác minh</Text></Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </>}
    </KeyboardAvoidingView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, gap: spacing.md },
  back: { paddingVertical: spacing.sm, alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontSize: 16 },
  title: { ...typography.title1 },
  description: { ...typography.body, color: colors.textSecondary },
  label: { ...typography.bodyMedium, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, color: colors.textPrimary },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  hint: { color: colors.textSecondary },
  message: { color: colors.textSecondary },
  success: { ...typography.bodyMedium, color: colors.success },
});
