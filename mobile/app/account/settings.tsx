import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { SettingsPresentation } from '@/features/account';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SettingsPresentation
        onBack={() => router.back()}
        onChangePasswordPress={() =>
          router.push('/account/change-password' as any)
        }
        onNotificationSettingsPress={() => {
          Alert.alert(
            'Quyền thông báo',
            'Ứng dụng Fitmate đã được cấp quyền gửi thông báo lịch tập và tin nhắn.'
          );
        }}
        onPrivacyPress={() => {
          Alert.alert(
            'Dữ liệu & Quyền riêng tư',
            'Dữ liệu của bạn được lưu trữ bảo mật theo tiêu chuẩn mã hóa AES-256.'
          );
        }}
        onTermsPress={() => {
          Alert.alert(
            'Điều khoản dịch vụ',
            'Nền tảng Fitmate tuân thủ hợp đồng bảo vệ quyền lợi hội viên và huấn luyện viên.'
          );
        }}
      />
    </SafeAreaView>
  );
}
