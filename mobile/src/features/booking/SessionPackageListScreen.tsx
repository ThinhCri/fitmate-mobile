import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { sessionPackageService, type SessionPackageWire } from '@/services/api/sessionPackageService';

const money = (amount: number) => `${amount.toLocaleString('vi-VN')} ₫`;
const packageStatus = (status: string) => ({
  Held: 'Đang giữ chỗ', OnlinePreparing: 'Đang chuẩn bị phòng tập',
  PaymentPending: 'Chờ thanh toán', Active: 'Đang hoạt động',
  StopRequested: 'Đang xử lý dừng gói', Stopped: 'Đã dừng',
  Expired: 'Đã hết hạn', LatePaymentRefundPending: 'Chờ xử lý hoàn tiền',
} as Record<string, string>)[status] ?? status;

export function SessionPackageListScreen({ asPt }: { asPt: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<SessionPackageWire[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (nextPage: number) => {
    const result = asPt
      ? await sessionPackageService.listAssigned(nextPage)
      : await sessionPackageService.listMine(nextPage);
    setItems((current) => nextPage === 1 ? result.items : [
      ...current, ...result.items.filter((item) => !current.some((existing) => existing.id === item.id)),
    ]);
    setPage(result.page);
    setTotal(result.total);
  }, [asPt]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setError('');
    setItems([]);
    setPage(0);
    setTotal(0);
    void fetchPage(1).catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách gói tập.');
    }).finally(() => setLoading(false));
  }, [fetchPage]));

  const loadMore = async () => {
    if (moreBusy || items.length >= total) return;
    setMoreBusy(true);
    try { await fetchPage(page + 1); setError(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải thêm gói tập.'); }
    finally { setMoreBusy(false); }
  };

  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.back}>
        <ChevronLeft size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={typography.title1}>{asPt ? 'Gói tập phụ trách' : 'Gói tập của tôi'}</Text>
    </View>
    {loading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.note}>Đang tải gói tập...</Text></View>
      : <ScrollView contentContainerStyle={styles.content}>
        {error ? <View style={styles.notice}><Text style={styles.error}>{error}</Text><Pressable onPress={() => { setLoading(true); void fetchPage(1).then(() => setError('')).catch((cause) => setError(cause instanceof Error ? cause.message : 'Không thể tải gói tập.')).finally(() => setLoading(false)); }} style={styles.link}><Text style={styles.linkText}>Thử lại</Text></Pressable></View> : null}
        {items.length === 0 && !error ? <View style={styles.center}>
          <Package size={48} color={colors.textMuted} />
          <Text style={typography.title3}>Chưa có gói tập</Text>
          <Text style={styles.note}>{asPt ? 'Gói đã bán và được phân công sẽ xuất hiện ở đây.' : 'Khi có gói PT, bạn sẽ xem các buổi và yêu cầu hỗ trợ tại đây.'}</Text>
        </View> : null}
        {items.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Xem gói ${item.session_count} buổi, ${packageStatus(item.status)}`}
          style={styles.card} onPress={() => router.push(asPt ? `/pt/package/${item.id}` as never : `/booking/package/${item.id}` as never)}>
          <View style={styles.row}><Text style={typography.title3}>Gói {item.session_count} buổi</Text><ChevronRight size={18} color={colors.primary} /></View>
          <Text style={styles.status}>{packageStatus(item.status)}</Text>
          <Text style={styles.note}>Tổng thanh toán: {money(item.total_price_vnd)}</Text>
          <Text style={styles.note}>Các buổi còn lại và chi tiết hoàn tiền nằm trong gói.</Text>
        </Pressable>)}
        {items.length < total ? <Pressable disabled={moreBusy} onPress={() => void loadMore()} style={styles.link} accessibilityRole="button"><Text style={styles.linkText}>{moreBusy ? 'Đang tải...' : 'Tải thêm'}</Text></Pressable> : null}
      </ScrollView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl, flex: 1 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, minHeight: 104 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { color: colors.primary, fontWeight: '600' },
  note: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  notice: { padding: spacing.md, backgroundColor: colors.dangerLight, borderRadius: radius.md },
  error: { ...typography.body, color: colors.danger },
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: colors.primary, fontWeight: '700' },
});
