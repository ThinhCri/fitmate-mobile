import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PtPayoutDetailPresentation } from '../../../src/features/pt/PtPayoutDetailPresentation';
import { ptDashboardService, RevenueItem } from '@/services/api/ptDashboardService';

export default function PtPayoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<RevenueItem | null>(null); const [error, setError] = useState('');
  useEffect(() => { if (id) ptDashboardService.getRevenueItem(id).then(setItem).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải khoản chi.')); }, [id]);

  if (!item) return <View style={[styles.container, styles.center]}>{error ? <Text>{error}</Text> : <ActivityIndicator />}</View>;
  const status = item.settlement_status === 'paid' ? 'paid_out' : item.settlement_status === 'approved' ? 'approved' : item.settlement_status === 'on_hold' ? 'on_hold' : 'pending';

  return (
    <View style={styles.container}>
      <PtPayoutDetailPresentation
        bookingCode={`BK-${item.appointment_id.slice(0, 8).toUpperCase()}`}
        clientName="Hội viên Fitmate"
        serviceName="Buổi huấn luyện"
        completedAt={new Date(item.date).toLocaleString('vi-VN')}
        grossAmountVnd={item.gross_vnd}
        platformFee10Vnd={item.platform_fee_vnd}
        ptShare90Vnd={item.net_vnd}
        refundAdjustedVnd={0}
        payoutStatus={status}
        referenceNumber={item.bank_reference || `PAY-${item.appointment_id.slice(0, 8).toUpperCase()}`}
        paidAt={item.transferred_at_utc ? new Date(item.transferred_at_utc).toLocaleString('vi-VN') : undefined}
        maskedBankInfo={item.payee_bank_name && item.payee_account_number_masked ? `${item.payee_bank_name} ${item.payee_account_number_masked} · ${item.payee_account_name || ''}` : 'Chưa chốt tài khoản thụ hưởng'}
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
  center: { alignItems: 'center', justifyContent: 'center' },
});
