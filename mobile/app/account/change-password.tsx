import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import {
  ChangePasswordPresentation,
  ChangePasswordFormData,
} from '@/features/account';

export default function ChangePasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: ChangePasswordFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Đổi mật khẩu thành công',
        'Mật khẩu mới đã được cập nhật. Bạn có thể tiếp tục sử dụng ứng dụng.',
        [{ text: 'Đóng', onPress: () => router.back() }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ChangePasswordPresentation
        isSubmitting={isSubmitting}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
