import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PtRevenuePresentation, PtRevenueBookingItemViewModel } from '@/features/pt/PtRevenuePresentation';
import { ptDashboardService } from '@/services/api/ptDashboardService';

interface RevenueData { overview: { total_gross_vnd: number; platform_fee_vnd: number; net_earnings_vnd: number; pending_payout_vnd: number; completed_payout_vnd: number }; bookings: PtRevenueBookingItemViewModel[]; historyPage: number; historyTotal: number; historyPageSize: number }
export default function PtRevenueScreen() {
  const router = useRouter(); const [data, setData] = useState<RevenueData | null>(null); const [error, setError] = useState('');
  const [range, setRange] = useState('30d'); const [page, setPage] = useState(1); const [attempt, setAttempt] = useState(0);
  const [periodOpen, setPeriodOpen] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true; setData(null); setError('');
    void ptDashboardService.getRevenue(range, page).then((value) => { if (active) setData(value); })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Không thể tải doanh thu.'); });
    return () => { active = false; };
  }, [range, page, attempt]));
  if (!data) return <View style={[styles.container, styles.center]}>{error ? <><Text style={styles.error}>{error}</Text><TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => setAttempt((value) => value + 1)}><Text>Thử lại</Text></TouchableOpacity></> : <ActivityIndicator />}</View>;
  const { overview } = data;
  return <View style={styles.container}>
    <PtRevenuePresentation periodLabel={range === 'all' ? 'Toàn thời gian' : `${parseInt(range, 10)} ngày`}
      grossGmvVnd={overview.total_gross_vnd} platformFee10PercentVnd={overview.platform_fee_vnd}
      ptShare90PercentVnd={overview.net_earnings_vnd} refundsAdjustedVnd={null}
      netPayoutVnd={overview.net_earnings_vnd} completedPayoutVnd={overview.completed_payout_vnd}
      pendingPayoutVnd={overview.pending_payout_vnd} historyPage={data.historyPage}
      historyTotal={data.historyTotal} historyPageSize={data.historyPageSize}
      onPreviousPage={() => setPage((value) => Math.max(1, value - 1))} onNextPage={() => setPage((value) => value + 1)}
      onFilterPeriod={() => setPeriodOpen(true)} bookings={data.bookings}
      onSelectBookingPayout={(id) => router.push(`/pt/payout/${id}` as never)}
      onManagePayoutAccount={() => router.push('/pt/payout-account' as never)} />
    <Modal visible={periodOpen} transparent animationType="fade" onRequestClose={() => setPeriodOpen(false)}>
      <View style={styles.overlay}><View style={styles.dialog} accessibilityViewIsModal>
        <Text style={styles.title}>Kỳ thống kê</Text>
        <Text>Áp dụng cho số liệu tổng quan. Bảng kê vẫn hiển thị toàn bộ lịch sử.</Text>
        {['7d', '30d', '90d', 'all'].map((value) => <TouchableOpacity key={value} accessibilityRole="button"
          style={styles.option} onPress={() => { setPeriodOpen(false); setRange(value); setPage(1); }}>
          <Text>{value === 'all' ? 'Toàn thời gian' : `${parseInt(value, 10)} ngày`}{value === range ? ' ✓' : ''}</Text>
        </TouchableOpacity>)}
        <TouchableOpacity accessibilityRole="button" style={styles.option} onPress={() => setPeriodOpen(false)}><Text>Đóng</Text></TouchableOpacity>
      </View></View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' }, center: { justifyContent: 'center', alignItems: 'center', padding: 24 }, error: { color: '#DC2626', textAlign: 'center' }, overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 }, dialog: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, gap: 12 }, title: { fontSize: 20, fontWeight: '700' }, option: { minHeight: 48, justifyContent: 'center' } });
