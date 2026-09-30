import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PtPayoutDetailPresentation } from '../../../src/features/pt/PtPayoutDetailPresentation';

export default function PtPayoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <PtPayoutDetailPresentation
        bookingCode="BK-20260928-8921"
        clientName="Trần Văn Minh"
        serviceName="Tập sức mạnh cá nhân 1-kèm-1"
        completedAt="Thứ Hai, 28/09/2026 • 19:00"
        grossAmountVnd={300000}
        platformFee10Vnd={30000}
        ptShare90Vnd={270000}
        refundAdjustedVnd={0}
        payoutStatus="approved"
        referenceNumber={id ? `PAY-${id}` : 'PAY-20260928-8921'}
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
