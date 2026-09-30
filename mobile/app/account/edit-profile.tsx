import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import {
  EditProfilePresentation,
  UserProfileFormData,
} from '@/features/account';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfileFormData>({
    name: 'Nguyễn Minh Anh',
    bio: 'Học viên chăm chỉ, yêu thích các bài tập tạ tổng hợp và chạy bộ ngoài trời.',
    phone: '0912 345 678',
    gender: 'female',
    birthday: '15/08/1998',
    heightCm: 165,
    weightKg: 55.4,
    fitnessGoal: 'Tăng cơ, giảm mỡ & Tăng sức bền tim mạch',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (values: UserProfileFormData) => {
    setIsSaving(true);
    setTimeout(() => {
      setProfile(values);
      setIsSaving(false);
      Alert.alert('Thành công', 'Hồ sơ cá nhân đã được cập nhật thành công.', [
        { text: 'Xong', onPress: () => router.back() },
      ]);
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <EditProfilePresentation
        initialValues={profile}
        isSaving={isSaving}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
        onPreviewPublicProfile={() =>
          router.push('/community/user/user-current' as any)
        }
        onHealthProfilePress={() =>
          router.push('/account/health-profile' as any)
        }
        onWeightHistoryPress={() => router.push('/workout/weight' as any)}
      />
    </SafeAreaView>
  );
}
