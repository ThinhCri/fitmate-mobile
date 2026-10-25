import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { getAccountRepository } from '@/repositories/accountRepository';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function DeletionOtpScreen() {
  const { user } = useAuth();
  const repository = getAccountRepository();
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const locked = useRef(false);
  const accountId = useRef(user?.id);
  useEffect(() => {
    if (accountId.current !== user?.id) router.replace('/account/settings' as any);
  }, [user?.id]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const listener = AppState.addEventListener('change', () => setNow(Date.now()));
    return () => { clearInterval(timer); listener.remove(); };
  }, []);
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
  const expired = sent && now >= expiresAt;
  const send = async () => {
    if (locked.current || remaining > 0) return;
    locked.current = true; setBusy(true);
    try {
      const result = await repository.sendDeletionOtp();
      setOtp(''); setSent(true); setNow(Date.now());
      setRetryAt(Date.now() + result.resendAfterSeconds * 1000);
      setExpiresAt(Date.parse(result.expiresAt));
    } catch (e) { Alert.alert('Không thể gửi mã', e instanceof Error ? e.message : 'Vui lòng thử lại.'); }
    finally { locked.current = false; setBusy(false); }
  };
  const confirm = async () => {
    if (locked.current || !/^\d{6}$/.test(otp) || expired) return;
    locked.current = true; setBusy(true);
    try {
      await repository.requestAccountDeletion(otp);
      setOtp('');
      Alert.alert('Đã gửi yêu cầu xóa tài khoản', 'Yêu cầu đang chờ quản trị viên xử lý. Đây chưa phải thao tác xóa tài khoản ngay lập tức.',
        [{ text: 'Đóng', onPress: () => router.replace('/account/settings' as any) }]);
    } catch (e) { Alert.alert('Không thể gửi yêu cầu', e instanceof Error ? e.message : 'Vui lòng kiểm tra mã OTP.'); }
    finally { locked.current = false; setBusy(false); }
  };
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => router.back()} style={styles.button}><Text style={styles.link}>← Quay lại</Text></TouchableOpacity>
        <Text style={typography.title1}>Xác thực yêu cầu xóa tài khoản</Text>
        <Text style={typography.body}>Chúng tôi sẽ gửi mã OTP tới email tài khoản{user?.email ? `: ${user.email}` : '.'}</Text>
        <Text style={typography.body}>Chỉ khi nhập đúng mã và nhấn xác nhận, yêu cầu xóa mới được gửi. Mã có hiệu lực 5 phút. Không cung cấp mã cho người khác.</Text>
        <Text style={typography.body}>Yêu cầu sẽ được quản trị viên xem xét. Các lịch hẹn hoặc nghĩa vụ tài chính chưa hoàn tất có thể ngăn việc gửi yêu cầu.</Text>
        <TouchableOpacity accessibilityRole="button" disabled={busy || remaining > 0} onPress={() => void send()} style={styles.button}>
          <Text style={styles.link}>{remaining > 0 ? `Gửi lại sau ${remaining} giây` : sent ? 'Gửi lại mã OTP' : 'Gửi mã OTP qua email'}</Text>
        </TouchableOpacity>
        {sent && <>
          <Text style={typography.body}>{expired ? 'Mã đã hết hạn. Vui lòng gửi lại mã.' : 'Kiểm tra hộp thư đến và thư rác để lấy mã OTP.'}</Text>
          <TextInput accessibilityLabel="Mã OTP xóa tài khoản" value={otp} editable={!busy} onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} placeholder="Nhập mã 6 chữ số" style={styles.input} />
          <TouchableOpacity accessibilityRole="button" disabled={busy || otp.length !== 6 || expired} onPress={() => void confirm()}
            style={[styles.confirm, (busy || otp.length !== 6 || expired) && styles.disabled]}>
            <Text style={styles.confirmText}>Xác nhận gửi yêu cầu xóa</Text>
          </TouchableOpacity>
        </>}
        {busy && <ActivityIndicator accessibilityLabel="Đang xử lý" color={colors.primary} />}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  button: { minHeight: 48, justifyContent: 'center', paddingVertical: spacing.sm },
  link: { ...typography.body, color: colors.primary, fontWeight: '600' },
  input: { ...typography.body, minHeight: 52, padding: spacing.md, borderWidth: 1, borderColor: colors.primary, borderRadius: 12 },
  confirm: { minHeight: 52, padding: spacing.md, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center' },
  confirmText: { ...typography.body, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
