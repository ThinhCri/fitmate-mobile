import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PtRevenuePresentation, PtRevenueBookingItemViewModel } from '@/features/pt/PtRevenuePresentation';
import { ptDashboardService } from '@/services/api/ptDashboardService';

interface RevenueData { overview: { total_gross_vnd: number; platform_fee_vnd: number; net_earnings_vnd: number; pending_payout_vnd: number; completed_payout_vnd: number }; bookings: PtRevenueBookingItemViewModel[] }
export default function PtRevenueScreen() {
  const router = useRouter(); const [data, setData] = useState<RevenueData | null>(null); const [error, setError] = useState('');
  useEffect(() => { ptDashboardService.getRevenue().then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải doanh thu.')); }, []);
  if (!data) return <View style={[styles.container, styles.center]}>{error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator />}</View>;
  const { overview } = data;
  return <View style={styles.container}><PtRevenuePresentation periodLabel="30 ngày" grossGmvVnd={overview.total_gross_vnd} platformFee10PercentVnd={overview.platform_fee_vnd} ptShare90PercentVnd={overview.net_earnings_vnd} refundsAdjustedVnd={Math.max(0, overview.total_gross_vnd - overview.platform_fee_vnd - overview.net_earnings_vnd)} netPayoutVnd={overview.net_earnings_vnd} bookings={data.bookings} onSelectBookingPayout={(id) => router.push(`/pt/payout/${id}` as never)} onManagePayoutAccount={() => router.push('/pt/payout-account' as never)} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' }, center: { justifyContent: 'center', alignItems: 'center', padding: 24 }, error: { color: '#DC2626', textAlign: 'center' } });
