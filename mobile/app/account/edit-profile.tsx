import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EditProfilePresentation, UserProfileFormData } from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';
import { ImagePickerService } from '@/services/imagePicker';
import { useAuth } from '@/services/AuthContext';
import { ConfirmationModal } from '@/components/design-system';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

export default function EditProfileScreen() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<UserProfileFormData | null>(null);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<{ storageKey: string; previewUrl: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const guard = useUnsavedChangesGuard(isDirty && !isSaving, () => setIsDirty(false));
  useEffect(() => { const repository = getAccountRepository(); Promise.all([repository.getProfile(), repository.getAccountHub()]).then(([data, hub]) => { setProfile(data); setUserId(hub.id); }).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ.')); }, []);
  const submit = async (values: UserProfileFormData) => {
    setIsSaving(true);
    try {
      const repository = getAccountRepository();
      await repository.updateProfile(values);
      const avatarUrl = pendingAvatar
        ? await repository.attachAvatar(pendingAvatar.storageKey)
        : values.avatarUrl;
      setProfile({ ...values, avatarUrl });
      setPendingAvatar(null);
      await refresh();
      setIsDirty(false);
      Alert.alert('Thành công', 'Hồ sơ cá nhân đã được cập nhật.', [{ text: 'Xong', onPress: () => requestAnimationFrame(() => router.back()) }]);
    }
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
      const uploaded = await getAccountRepository().updateAvatar(image);
      setPendingAvatar(uploaded);
      Alert.alert('Ảnh đã sẵn sàng', 'Hãy nhấn Lưu để cập nhật ảnh đại diện.');
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
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <EditProfilePresentation initialValues={profile} avatarPreviewUrl={pendingAvatar?.previewUrl} hasPendingAvatar={Boolean(pendingAvatar)} isSaving={isSaving} onBack={() => router.back()} onSubmit={submit} onAvatarPress={chooseAvatar} onPreviewPublicProfile={() => userId && router.push(`/community/user/${userId}` as never)} onHealthProfilePress={() => router.push('/account/health-profile' as never)} onWeightHistoryPress={() => router.push('/workout/weight' as never)} onDirtyChange={setIsDirty} />
    <ConfirmationModal visible={guard.visible} title="Bỏ thay đổi?" message="Bạn có thay đổi chưa lưu. Bạn có muốn thoát mà không lưu không?" confirmLabel="Thoát không lưu" onConfirm={guard.discard} onCancel={guard.cancel} />
  </SafeAreaView>;
}
