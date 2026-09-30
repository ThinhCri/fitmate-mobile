import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PtRevenuePresentation } from '../../src/features/pt/PtRevenuePresentation';

const MOCK_REVENUE_BOOKINGS = [
  {
    bookingId: 'bk-1',
    bookingCode: 'BK-20260928-8921',
    clientName: 'Trần Văn Minh',
    serviceName: 'Tập sức mạnh cá nhân 1-kèm-1',
    completedDate: 'Hôm nay, 19:00',
    grossAmountVnd: 300000,
    platformFeeVnd: 30000,
    ptShareVnd: 270000,
    payoutStatus: 'approved' as const,
  },
  {
    bookingId: 'bk-2',
    bookingCode: 'BK-20260926-4431',
    clientName: 'Nguyễn Thị Hoa',
    serviceName: 'Cardio giảm mỡ chuyên sâu',
    completedDate: '26/09/2026, 10:00',
    grossAmountVnd: 350000,
    platformFeeVnd: 35000,
    ptShareVnd: 315000,
    payoutStatus: 'paid_out' as const,
  },
  {
    bookingId: 'bk-3',
    bookingCode: 'BK-20260924-1102',
    clientName: 'Lê Hoàng Long',
    serviceName: 'Tập sức mạnh cá nhân 1-kèm-1',
    completedDate: '24/09/2026, 18:00',
    grossAmountVnd: 300000,
    platformFeeVnd: 30000,
    ptShareVnd: 270000,
    payoutStatus: 'paid_out' as const,
  },
];

export default function PtRevenueScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PtRevenuePresentation
        periodLabel="Tháng 9/2026"
        grossGmvVnd={15000000}
        platformFee10PercentVnd={1500000}
        ptShare90PercentVnd={13500000}
        refundsAdjustedVnd={0}
        netPayoutVnd={13500000}
        bookings={MOCK_REVENUE_BOOKINGS}
        onSelectBookingPayout={(id) => router.push(`/pt/payout/${id}` as any)}
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
