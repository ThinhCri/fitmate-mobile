import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { getAccountRepository } from '@/repositories/accountRepository';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export default function VerifyPtPhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    getAccountRepository().getProfile().then((profile) => {
      if (!active) return;
      setPhone(profile.phone || '');
    }).catch(() => { if (active) setMessage('Không thể tải số liên hệ. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const saveContactPhone = async () => {
    if (busy) return;
    const normalized = phone.trim();
    if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalized)) {
      setMessage('Nhập số di động Việt Nam hợp lệ, ví dụ 0901234567.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const repository = getAccountRepository();
      const profile = await repository.getProfile();
      await repository.updateProfile({ ...profile, phone: normalized });
      router.replace('/pt/certificates');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu số liên hệ.');
    } finally {
      setBusy(false);
    }
  };

  return <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}><Text style={styles.backText}>‹ Quay lại</Text></Pressable>
      <Text style={styles.title}>Số điện thoại liên hệ</Text>
      <Text style={styles.description}>Nhập số điện thoại bạn đang sử dụng để Fitmate có thể liên hệ khi xét duyệt hồ sơ PT.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : <>
          <Text style={styles.label}>Số điện thoại Việt Nam</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+84901234567" style={styles.input} editable={!busy} accessibilityLabel="Số điện thoại PT" />
          <Pressable onPress={() => void saveContactPhone()} disabled={busy} style={[styles.button, busy && styles.disabled]} accessibilityRole="button"><Text style={styles.buttonText}>Lưu số liên hệ</Text></Pressable>
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
