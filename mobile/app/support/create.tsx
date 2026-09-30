import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import {
  CreateTicketPresentation,
  CreateTicketFormValues,
} from '@/features/support';

export default function CreateTicketScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: CreateTicketFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Đã gửi yêu cầu hỗ trợ',
        'Bộ phận chăm sóc khách hàng Fitmate đã tiếp nhận thông tin và sẽ phản hồi trong luồng trao đổi.',
        [
          {
            text: 'Xem danh sách',
            onPress: () => router.replace('/support' as any),
          },
        ]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CreateTicketPresentation
        initialValues={{
          linkedBookingId: bookingId,
          category: bookingId ? 'booking_dispute' : 'other',
        }}
        isSubmitting={isSubmitting}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
