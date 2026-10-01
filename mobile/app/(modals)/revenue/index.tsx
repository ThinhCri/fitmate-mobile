/**
 * RevenueScreen — FP-034 (PT Revenue).
 *
 * Route: /(modals)/revenue
 *
 * Man hinh Doanh thu cho PT:
 *  - Header: title + nhãn "Dữ liệu mẫu".
 *  - Bộ lọc thời gian: tháng này / tháng trước / 3 tháng gần đây.
 *  - KPI chính: Thu nhập trong kỳ (sau phí 10% và điều chỉnh hoàn tiền).
 *  - Sub-metrics: Giá trị dịch vụ hoàn thành, Phí nền tảng, Điều chỉnh hoàn tiền,
 *    Buổi hoàn thành.
 *  - Khu vực "Chờ hoàn thành" (số dư hiện tại, không theo kỳ).
 *  - Biểu đồ: thu nhập theo thời gian (bar chart, hỗ trợ cột âm).
 *  - Lịch sử thu nhập: earnings + refund_adjustments, filter loại, search, load more.
 *  - Tap vào item → chi tiết booking.
 *
 * Phan quyen: chi hien thi khi user.profile.isPt === true. Member bi redirect.
 * Day la kiem tra client (UI/UX). Khi tich hop backend: backend van la nguon tham
 * quyen ve quyen truy cap va so lieu (xem spec phan 6).
 */
import { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, ChevronDown, Copy, Lock, TrendingDown, Search } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import {
  canAccessRevenue,
  computeRevenueKPI,
  computeRevenueChart,
  computeRevenueHistory,
  type RevenuePeriod,
  type RevenueHistoryItem,
  type BookingForPT,
} from '@/features/pt-revenue/revenueCalculations';
import { getBookingsForPT } from '@/features/pt-revenue/revenueFixtures';
import { Card, Chip, Button, Input, Empty, BarChart } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { isPreviewMode } from '@/repositories/repositoryTypes';

const PERIODS: Array<{ key: RevenuePeriod; label: string }> = [
  { key: 'this_month', label: 'Tháng này' },
  { key: 'last_month', label: 'Tháng trước' },
  { key: 'last_3_months', label: '3 tháng gần đây' },
];

const PAGE_SIZE = 20;

function formatVND(v: number): string {
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  return `${sign}${abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function RevenueScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [period, setPeriod] = useState<RevenuePeriod>('this_month');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'earning' | 'refund_adjustment'>('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [refreshing, setRefreshing] = useState(false);
  const [periodPickerOpen, setPeriodPickerOpen] = useState(false);

  const isPt = canAccessRevenue(user);
  const isPreview = isPreviewMode();
  const userEmail = user?.email ?? '';

  const bookings = useMemo<BookingForPT[]>(
    () => (isPt && isPreview && userEmail ? getBookingsForPT(userEmail) : []),
    [isPt, isPreview, userEmail],
  );

  const kpi = useMemo(() => computeRevenueKPI(bookings, period), [bookings, period]);
  const chartData = useMemo(
    () =>
      computeRevenueChart(bookings, period).map((p) => ({
        label: p.label,
        period: p.period,
        value: p.net,
      })),
    [bookings, period],
  );

  const historyAll = useMemo(
    () => computeRevenueHistory(bookings, period, historyFilter),
    [bookings, period, historyFilter],
  );
  const historyFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return historyAll;
    return historyAll.filter((h) => {
      const booking = bookings.find((b) => b.id === h.bookingId);
      return (
        h.memberName.toLowerCase().includes(q) ||
        h.bookingId.toLowerCase().includes(q) ||
        (booking?.memberEmail ?? '').toLowerCase().includes(q)
      );
    });
  }, [historyAll, search, bookings]);

  const historyVisible = historyFiltered.slice(0, visibleCount);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setVisibleCount(PAGE_SIZE);
    }, 500);
  }, []);

  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? 'Tháng này';

  // Access guard — chi cho PT.
  if (!isPt) {
    const fallbackUser = user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
          </Pressable>
          <Empty
            icon={<Lock color={resolveColor(theme, 'onSurfaceVariant')} size={28} />}
            title="Chỉ dành cho HLV (PT)"
            description={
              fallbackUser
                ? `Tính năng Doanh thu chỉ hiển thị với tài khoản PT. Tài khoản hiện tại (${fallbackUser.profile.name}) là hội viên.`
                : 'Tính năng Doanh thu chỉ hiển thị với tài khoản PT trong bản demo này.'
            }
            actionLabel="Quay lại"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Production guard — không tính tiền giả / không dùng fixtures làm nguồn tiền trong production.
  if (!isPreview) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
          </Pressable>
          <Empty
            icon={<TrendingUp color={resolveColor(theme, 'primary')} size={32} />}
            title="Dữ liệu doanh thu & đối soát"
            description="Báo cáo tài chính và đối soát thu nhập PT sẽ được tự động tổng hợp từ hệ thống máy chủ Fitmate sau kỳ kết toán."
            actionLabel="Quay lại"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = user!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderBottomColor: resolveColor(theme, 'outlineVariant'),
          borderBottomWidth: 1,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Quay lại">
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: resolveColor(theme, 'onSurface') }}>
            Doanh thu
          </Text>
          <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 2 }}>
            Dữ liệu mẫu · {currentUser.profile.name}
          </Text>
        </View>
        <Chip label={periodLabel} tone="primary" onPress={() => setPeriodPickerOpen(!periodPickerOpen)} />
      </View>

      {/* Period picker */}
      {periodPickerOpen ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 12,
            gap: 8,
            backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
          }}
        >
          {PERIODS.map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              tone={period === p.key ? 'primary' : 'neutral'}
              onPress={() => {
                setPeriod(p.key);
                setPeriodPickerOpen(false);
                setVisibleCount(PAGE_SIZE);
              }}
            />
          ))}
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Main KPI card */}
        <Card>
          <Text style={{ fontSize: 12, color: resolveColor(theme, 'onSurfaceVariant'), fontWeight: '600' }}>
            Thu nhập trong kỳ
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: resolveColor(theme, 'onSurface'), marginTop: 6 }}>
            {formatVND(kpi.completedEarnings)}
          </Text>
          <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 4 }}>
            Sau phí nền tảng 10% và điều chỉnh hoàn tiền
          </Text>
          {kpi.refundAdjustment !== 0 ? (
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={12} color={resolveColor(theme, 'error')} />
              <Text style={{ fontSize: 11, color: resolveColor(theme, 'error') }}>
                Điều chỉnh hoàn: {formatVND(kpi.refundAdjustment)}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Sub metrics — flexWrap de responsive */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Card variant="default">
              <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant') }}>
                Giá trị dịch vụ hoàn thành
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: resolveColor(theme, 'onSurface'), marginTop: 4 }}>
                {formatVND(kpi.completedServiceValue)}
              </Text>
            </Card>
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Card variant="default">
              <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant') }}>
                Phí nền tảng
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: resolveColor(theme, 'onSurface'), marginTop: 4 }}>
                {formatVND(kpi.platformFee)}
              </Text>
            </Card>
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Card variant="default">
              <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant') }}>
                Điều chỉnh hoàn tiền
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: kpi.refundAdjustment < 0 ? resolveColor(theme, 'error') : resolveColor(theme, 'onSurface'), marginTop: 4 }}>
                {formatVND(kpi.refundAdjustment)}
              </Text>
            </Card>
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Card variant="default">
              <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant') }}>
                Buổi hoàn thành
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: resolveColor(theme, 'onSurface'), marginTop: 4 }}>
                {kpi.completedCount}
              </Text>
            </Card>
          </View>
        </View>

        {/* Pending section (separate, khong theo ky) */}
        <Card variant="flat">
          <Text style={{ fontSize: 12, color: resolveColor(theme, 'onSurfaceVariant'), fontWeight: '600' }}>
            Chờ hoàn thành
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: resolveColor(theme, 'onSurface'), marginTop: 6 }}>
            {formatVND(kpi.pendingEarnings)}
          </Text>
          <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 4 }}>
            {kpi.pendingCount} buổi đã thanh toán, đang chờ hoàn thành
          </Text>
          <Text style={{ fontSize: 10, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 6, fontStyle: 'italic' }}>
            Hiện tại · Không theo bộ lọc thời gian
          </Text>
        </Card>

        {/* Chart */}
        <Card>
          <BarChart
            title="Thu nhập theo thời gian"
            data={chartData}
            unit="VND"
            accessibilityLabel={`Biểu đồ thu nhập ${periodLabel}. Tổng: ${formatVND(kpi.completedEarnings)}`}
          />
        </Card>

        {/* History filter + search */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: resolveColor(theme, 'onSurface'), marginBottom: 8 }}>
            Lịch sử thu nhập
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <Chip label="Tất cả" tone={historyFilter === 'all' ? 'primary' : 'neutral'} onPress={() => { setHistoryFilter('all'); setVisibleCount(PAGE_SIZE); }} />
            <Chip label="Thu nhập" tone={historyFilter === 'earning' ? 'primary' : 'neutral'} onPress={() => { setHistoryFilter('earning'); setVisibleCount(PAGE_SIZE); }} />
            <Chip label="Điều chỉnh hoàn tiền" tone={historyFilter === 'refund_adjustment' ? 'primary' : 'neutral'} onPress={() => { setHistoryFilter('refund_adjustment'); setVisibleCount(PAGE_SIZE); }} />
          </View>
          <Input
            label=""
            placeholder="Tìm theo học viên, dịch vụ hoặc mã booking"
            value={search}
            onChangeText={(t) => { setSearch(t); setVisibleCount(PAGE_SIZE); }}
            leftIcon={<Search size={16} color={resolveColor(theme, 'onSurfaceVariant')} />}
          />
        </View>

        {/* History list */}
        {historyFiltered.length === 0 ? (
          <Empty
            icon={<Search color={resolveColor(theme, 'onSurfaceVariant')} size={28} />}
            title={search ? 'Không có kết quả tìm kiếm' : 'Chưa có dữ liệu'}
            description={
              search
                ? `Không có mục nào khớp với "${search}" trong kỳ này.`
                : 'Chưa có ghi nhận thu nhập hoặc điều chỉnh hoàn tiền nào trong kỳ đã chọn.'
            }
          />
        ) : (
          <View style={{ gap: 8 }}>
            {historyVisible.map((h) => (
              <HistoryItem
                key={h.id}
                item={h}
                onPress={() => router.push(`/(modals)/revenue/${h.bookingId}` as never)}
              />
            ))}
            {historyVisible.length < historyFiltered.length ? (
              <Button
                label={`Xem thêm (còn ${historyFiltered.length - historyVisible.length})`}
                variant="ghost"
                onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// =======================================================================
// History item
// =======================================================================

function HistoryItem({ item, onPress }: { item: RevenueHistoryItem; onPress: () => void }) {
  const theme = useTheme();
  const isRefund = item.eventType === 'refund_adjustment';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.description} - ${item.memberName} - ${formatVND(item.ptChange)}`}
      style={({ pressed }) => ({
        opacity: pressed ? theme.tokens.opacity.pressed : 1,
      })}
    >
      <Card variant="default">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: resolveColor(theme, 'onSurface') }}>
              {item.memberName}
            </Text>
            <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 2 }}>
              {item.description} · {formatDate(item.eventAt)}
            </Text>
            <Text style={{ fontSize: 10, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 2 }}>
              Mã: {item.bookingId} · Trạng thái: {item.bookingStatus}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: isRefund ? resolveColor(theme, 'error') : resolveColor(theme, 'primary'),
            }}
          >
            {isRefund ? '' : '+'}
            {formatVND(item.ptChange)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
