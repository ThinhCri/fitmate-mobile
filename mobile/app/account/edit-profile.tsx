import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EditProfilePresentation, UserProfileFormData } from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfileFormData | null>(null);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => { const repository = getAccountRepository(); Promise.all([repository.getProfile(), repository.getAccountHub()]).then(([data, hub]) => { setProfile(data); setUserId(hub.id); }).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ.')); }, []);
  const submit = async (values: UserProfileFormData) => {
    setIsSaving(true);
    try { await getAccountRepository().updateProfile(values); setProfile(values); Alert.alert('Thành công', 'Hồ sơ cá nhân đã được cập nhật.', [{ text: 'Xong', onPress: () => router.back() }]); }
    catch (e) { Alert.alert('Không thể cập nhật', e instanceof Error ? e.message : 'Vui lòng thử lại.'); }
    finally { setIsSaving(false); }
  };
  if (!profile) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error ? <Text>{error}</Text> : <ActivityIndicator />}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><EditProfilePresentation initialValues={profile} isSaving={isSaving} onBack={() => router.back()} onSubmit={submit} onPreviewPublicProfile={() => userId && router.push(`/community/user/${userId}` as never)} onHealthProfilePress={() => router.push('/account/health-profile' as never)} onWeightHistoryPress={() => router.push('/workout/weight' as never)} /></SafeAreaView>;
}
