import { colors } from '@/theme/designTokens';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HealthProfilePresentation, HealthProfileData } from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';

export default function HealthProfileScreen() {
  const [data, setData] = useState<HealthProfileData | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { getAccountRepository().getHealthProfile().then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ sức khỏe.')); }, []);
  const submit = async (values: HealthProfileData) => { setSaving(true); try { await getAccountRepository().updateHealthProfile(values); setData(values); Alert.alert('Thành công', 'Hồ sơ sức khỏe đã được cập nhật.', [{ text: 'Xong', onPress: () => router.back() }]); } catch (e) { Alert.alert('Không thể cập nhật', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSaving(false); } };
  if (!data) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error ? <Text>{error}</Text> : <ActivityIndicator />}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><HealthProfilePresentation initialValues={data} isSaving={saving} onBack={() => router.back()} onSubmit={submit} /></SafeAreaView>;
}
