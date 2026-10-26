import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { bookingService } from '@/services/api/bookingService';
import { ptService } from '@/services/api/ptService';
import type { ListAppointmentsResponse, Service } from '@/services/api/types';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

const filters = [
  { value: '', label: 'Tất cả' }, { value: 'Pending', label: 'Chờ phản hồi' },
  { value: 'Confirmed', label: 'Đã xác nhận' }, { value: 'InProgress', label: 'Đang diễn ra' },
  { value: 'AwaitingMemberConfirmation', label: 'Chờ học viên xác nhận' }, { value: 'Completed', label: 'Đã hoàn tất' },
] as const;
const statusLabels: Record<string, string> = {
  Held: 'Đang giữ chỗ', Pending: 'Chờ PT phản hồi', Confirmed: 'Đã xác nhận', InProgress: 'Đang diễn ra',
  AwaitingMemberConfirmation: 'Chờ học viên xác nhận', Completed: 'Đã hoàn tất', Cancelled: 'Đã hủy',
  Expired: 'Đã hết hạn', Disputed: 'Đang có tranh chấp', NoShow: 'Vắng mặt',
};

export default function PtSessionsScreen() {
  const { user, loading: authLoading } = useAuth();
  const params = useLocalSearchParams<{ status?: string }>();
  const [status, setStatus] = useState(filters.some((item) => item.value === params.status) ? params.status || '' : '');
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<ListAppointmentsResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  useFocusEffect(useCallback(() => {
    if (authLoading || !user) return;
    if (user.role !== 'pt' || user.ptVerificationStatus !== 'approved') { router.replace('/pt/certificates'); return; }
    let active = true;
    setBusy(true); setError(''); setData(null);
    void Promise.all([
      bookingService.listMyTrainerBookings({ status: status || undefined, page, pageSize: 20 }),
      ptService.getMyServices(true),
    ]).then(([rows, offerings]) => { if (active) { setData(rows); setServices(offerings); } })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Không tải được buổi dạy.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [authLoading, user, page, status, attempt]));
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.button}><Text style={styles.link}>← Quay lại</Text></TouchableOpacity>
      <Text style={typography.title1}>Buổi dạy của tôi</Text>
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setAttempt((value) => value + 1)} style={styles.button}><Text style={styles.link}>Tải lại</Text></TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.filters}>{filters.map((item) => <TouchableOpacity key={item.value} accessibilityRole="button"
        accessibilityState={{ selected: status === item.value }} onPress={() => { setStatus(item.value); setPage(1); }}
        style={[styles.filter, status === item.value && styles.selected]}><Text style={styles.link}>{item.label}</Text></TouchableOpacity>)}</View>
      {busy ? <ActivityIndicator color={colors.primary} accessibilityLabel="Đang tải buổi dạy" /> : error ? <>
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={styles.button}><Text style={styles.link}>Thử lại</Text></TouchableOpacity>
      </> : data && <>
        <Text style={typography.body}>Tổng cộng: {data.total} buổi</Text>
        {data.items.length === 0 && <Text style={typography.body}>Không có buổi dạy phù hợp với bộ lọc này.</Text>}
        {data.items.map((item) => <TouchableOpacity key={item.id} accessibilityRole="button" style={styles.session}
          onPress={() => router.push(`/pt/session/${item.id}` as never)}>
          <Text style={typography.title3}>{services.find((service) => service.id === item.service_id)?.name || 'Dịch vụ chưa có tên'}</Text>
          <Text style={typography.body}>{new Date(item.slot_start_utc).toLocaleString('vi-VN')}</Text>
          <Text style={typography.caption}>Mã hội viên: {item.member_id.slice(0, 8)}</Text>
          <Text style={styles.link}>{statusLabels[item.status] || 'Trạng thái chưa hỗ trợ'} · Xem chi tiết →</Text>
        </TouchableOpacity>)}
        <View style={styles.pagination}>
          <TouchableOpacity accessibilityRole="button" disabled={page <= 1} onPress={() => setPage((value) => value - 1)} style={styles.button}><Text style={page <= 1 ? styles.muted : styles.link}>Trang trước</Text></TouchableOpacity>
          <Text style={typography.body}>Trang {data.page}</Text>
          <TouchableOpacity accessibilityRole="button" disabled={data.page * data.pageSize >= data.total} onPress={() => setPage((value) => value + 1)} style={styles.button}><Text style={data.page * data.pageSize >= data.total ? styles.muted : styles.link}>Trang sau</Text></TouchableOpacity>
        </View>
      </>}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, gap: spacing.xs }, content: { padding: spacing.md, gap: spacing.md },
  button: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.sm },
  link: { ...typography.body, color: colors.primary }, muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: { minHeight: 48, padding: spacing.sm, justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primaryLight }, session: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
