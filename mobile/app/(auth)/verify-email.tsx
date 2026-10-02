import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MailCheck } from 'lucide-react-native';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { authService } from '@/services/api/authService';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}***${local.length > 1 ? local.slice(-1) : ''}@${domain}`;
}

export default function VerifyEmailScreen() {
  const { email: rawEmail } = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(() => (rawEmail || '').trim().toLowerCase(), [rawEmail]);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const verify = async () => {
    if (!email || !/^\d{6}$/.test(code)) {
      setError('Vui lòng nhập đủ mã xác minh gồm 6 chữ số.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await authService.verifyEmail(email, code);
      router.replace({ pathname: '/(auth)/login', params: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác minh email.');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    setMessage('');
    try {
      await authService.resendEmailVerification(email);
      setMessage('Nếu tài khoản hợp lệ, mã mới đã được gửi. Hãy kiểm tra cả thư rác.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi lại mã xác minh.');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenContainer backgroundColor={colors.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.iconButton} accessibilityLabel="Quay lại đăng nhập">
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác minh email</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}><MailCheck size={40} color={colors.primary} /></View>
        <Text style={styles.title}>Nhập mã trong email</Text>
        <Text style={styles.description}>Fitmate đã gửi mã gồm 6 chữ số đến {maskEmail(email)}. Mã chỉ có hiệu lực trong thời gian ngắn.</Text>

        <TextInput
          value={code}
          onChangeText={(value) => { setCode(value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={6}
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          editable={!submitting}
          accessibilityLabel="Mã xác minh email gồm 6 chữ số"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabled]} onPress={() => void verify()} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>Xác minh</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void resend()} disabled={resending}>
          {resending ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.secondaryText}>Gửi lại mã</Text>}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title2, color: colors.textPrimary, fontWeight: '700' },
  content: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  iconCircle: { width: 88, height: 88, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  title: { ...typography.title1, color: colors.textPrimary, textAlign: 'center' },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  codeInput: { width: '100%', height: 60, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, color: colors.textPrimary, textAlign: 'center', fontSize: 28, fontWeight: '700', letterSpacing: 10 },
  error: { ...typography.caption, color: colors.danger, textAlign: 'center' },
  success: { ...typography.caption, color: colors.success, textAlign: 'center' },
  primaryButton: { width: '100%', height: 52, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryText: { ...typography.bodyBold, color: colors.white },
  secondaryButton: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...typography.bodyBold, color: colors.primary },
  disabled: { opacity: 0.65 },
});
