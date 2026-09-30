import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PtSessionManagementPresentation } from '../../../src/features/pt/PtSessionManagementPresentation';

export default function PtSessionManagementScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'in_progress' | 'completed'>('confirmed');

  const handleComplete = (notes: string) => {
    setStatus('completed');
    Alert.alert(
      'Buổi tập hoàn thành',
      'Đã lưu ghi chú huấn luyện. Hồ sơ buổi tập đã được chuyển đến ban quản trị để đối soát quyết toán.',
      [{ text: 'Đóng', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <PtSessionManagementPresentation
        sessionId={id || 'ses-1'}
        bookingCode="BK-20260928-8921"
        clientName="Trần Văn Minh"
        clientGoal="Tăng cơ ngực & Thể lực"
        serviceName="Tập sức mạnh cá nhân 1-kèm-1"
        scheduledTime="18:00 - 19:00 • Hôm nay"
        location="Fitmate Gym Thảo Điền"
        status={status}
        paidAmountVnd={300000}
        onStartSession={() => setStatus('in_progress')}
        onCompleteSession={handleComplete}
        onCancelSession={(_reason) => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
