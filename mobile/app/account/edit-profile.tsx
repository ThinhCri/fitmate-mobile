import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EditProfilePresentation, UserProfileFormData } from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';
import { ImagePickerService } from '@/services/imagePicker';

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
  const uploadAvatar = async (source: 'camera' | 'library') => {
    if (isSaving) return;
    const image = source === 'camera'
      ? await ImagePickerService.pickFromCamera({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePickerService.pickFromLibrary({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!image) return;

    setIsSaving(true);
    try {
      const avatarUrl = await getAccountRepository().updateAvatar(image);
      setProfile((current) => current ? { ...current, avatarUrl } : current);
      Alert.alert('Đã cập nhật', 'Ảnh đại diện của bạn đã được thay đổi.');
    } catch (e) {
      Alert.alert(
        'Không thể cập nhật ảnh đại diện',
        e instanceof Error ? e.message : 'Vui lòng chọn ảnh khác và thử lại.'
      );
    } finally {
      setIsSaving(false);
    }
  };
  if (!profile) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error ? <Text>{error}</Text> : <ActivityIndicator />}</SafeAreaView>;
  const chooseAvatar = () => Alert.alert('Đổi ảnh đại diện', 'Chọn nguồn ảnh', [
    { text: 'Máy ảnh', onPress: () => void uploadAvatar('camera') },
    { text: 'Thư viện', onPress: () => void uploadAvatar('library') },
    { text: 'Hủy', style: 'cancel' },
  ]);
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><EditProfilePresentation initialValues={profile} isSaving={isSaving} onBack={() => router.back()} onSubmit={submit} onAvatarPress={chooseAvatar} onPreviewPublicProfile={() => userId && router.push(`/community/user/${userId}` as never)} onHealthProfilePress={() => router.push('/account/health-profile' as never)} onWeightHistoryPress={() => router.push('/workout/weight' as never)} /></SafeAreaView>;
}
