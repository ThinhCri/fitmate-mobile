import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChangePasswordPresentation, ChangePasswordFormData } from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';

export default function ChangePasswordScreen() {
  const [submitting, setSubmitting] = useState(false);
  const submit = async (values: ChangePasswordFormData) => { setSubmitting(true); try { await getAccountRepository().changePassword(values.currentPassword, values.newPassword); Alert.alert('Đổi mật khẩu thành công', 'Mật khẩu mới đã được cập nhật.', [{ text: 'Đóng', onPress: () => router.back() }]); } catch (e) { Alert.alert('Không thể đổi mật khẩu', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSubmitting(false); } };
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><ChangePasswordPresentation isSubmitting={submitting} onBack={() => router.back()} onSubmit={submit} /></SafeAreaView>;
}
