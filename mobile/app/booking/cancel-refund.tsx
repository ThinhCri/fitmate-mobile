import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CancelRefundTrackingPresentation } from '../../src/features/booking/CancelRefundTrackingPresentation';
import { RefundTrackingViewModel } from '../../src/features/booking/bookingTypes';

export default function CancelRefundScreen() {
  const router = useRouter();
  const [refundData, setRefundData] = useState<RefundTrackingViewModel | undefined>(undefined);

  const handleConfirmCancel = (reason: string) => {
    const tracking: RefundTrackingViewModel = {
      bookingId: 'bk-1',
      bookingCode: 'BK-20260928-8921',
      refundStatus: 'pending',
      requestedAmountVnd: 300000,
      refundAmountVnd: 300000,
      requestedAt: 'Hôm nay, 19:40',
      reason,
      cancellationPolicyNotice: 'Được hoàn 100% (hủy trước 24h)',
    };
    setRefundData(tracking);
    Alert.alert(
      'Yêu cầu đã ghi nhận',
      'Yêu cầu hủy lịch và hoàn tiền đã được gửi. Bạn có thể theo dõi tiến trình ngay tại màn hình này.'
    );
  };

  return (
    <View style={styles.container}>
      <CancelRefundTrackingPresentation
        refundData={refundData}
        bookingCode="BK-20260928-8921"
        paidAmountVnd={300000}
        eligibleRefundAmountVnd={300000}
        onConfirmCancel={handleConfirmCancel}
        onContactSupport={() => router.push('/support/new' as any)}
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
