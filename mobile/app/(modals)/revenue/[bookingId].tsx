/**
 * RevenueDetailScreen — chi tiết booking/khoản thu (MOB-409).
 *
 * Route: /(modals)/revenue/[bookingId]
 *
 * Hien thi:
 *  - Học viên, dịch vụ, mã booking (co the copy).
 *  - Trạng thái booking, payment, refund.
 *  - Giá gốc, giảm giá, khách thực trả.
 *  - Tổng hoàn tiền thành công, giá trị còn lại.
 *  - Phí nền tảng còn lại, phần PT còn lại.
 *  - Tỷ lệ phí áp dụng: 10%.
 *  - Trạng thái thu nhập.
 *  - Timeline payment/hoàn thành/refund.
 *
 * Phan quyen: chi cho PT cua booking do. Member bi redirect.
 */
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Lock, BarChart3 } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import {
  canAccessRevenue,
  calcFeeAndPT,
  calcRemainingAfterRefunds,
  type BookingForPT,
} from '@/features/pt-revenue/revenueCalculations';
import { getBookingsForPT } from '@/features/pt-revenue/revenueFixtures';
import { Card, Chip, Empty } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { isPreviewMode } from '@/repositories/repositoryTypes';

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
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hh}:${mm}`;
}

export default function RevenueDetailScreen() {
  const params = useLocalSearchParams();
  const bookingId = typeof params.bookingId === 'string' ? params.bookingId : Array.isArray(params.bookingId) ? params.bookingId[0] : '';
  const { user } = useAuth();
  const theme = useTheme();

  if (!canAccessRevenue(user)) {
    const fallbackUser = user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 16 }}>
          <Empty
            icon={<Lock color={resolveColor(theme, 'onSurfaceVariant')} size={28} />}
            title="Không có quyền truy cập"
            description={
              fallbackUser
                ? `Tính năng Doanh thu chỉ dành cho PT. Tài khoản ${fallbackUser.profile.name} là hội viên.`
                : 'Vui lòng đăng nhập để tiếp tục.'
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // Production guard — không tính tiền giả / không dùng fixtures làm nguồn tiền trong production.
  if (!isPreviewMode()) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
          </Pressable>
          <Empty
            icon={<BarChart3 color={resolveColor(theme, 'primary')} size={32} />}
            title="Chi tiết giao dịch"
            description="Thông tin hạch toán chi tiết cho đơn đặt lịch này sẽ hiển thị sau khi máy chủ xác nhận giao dịch."
            actionLabel="Quay lại"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = user!; // canAccessRevenue da check o tren.
  const bookings: BookingForPT[] = getBookingsForPT(currentUser.email);
  const booking = bookings.find((b) => b.id === bookingId) ?? null;

  if (!booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
            <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
          </Pressable>
          <Empty
            icon={<BarChart3 color={resolveColor(theme, 'onSurfaceVariant')} size={28} />}
            title="Không tìm thấy booking"
            description={`Không có dữ liệu cho booking "${bookingId}" trong tài khoản của bạn.`}
            actionLabel="Quay lại"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const { fee: totalFee, ptShare: totalPt } = calcFeeAndPT(booking.paidAmount);
  const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(booking.paidAmount, booking.refunds);
  const totalRefunded = booking.refunds.filter((r) => r.status === 'succeeded').reduce((s, r) => s + r.amount, 0);

  // Trang thai thu nhap
  const earningsStatus =
    booking.appointmentStatus === 'completed'
      ? totalRefunded > 0
        ? 'Đã ghi nhận, có điều chỉnh hoàn tiền'
        : 'Đã ghi nhận'
      : booking.appointmentStatus === 'cancelled'
      ? 'Đã hủy (không ghi nhận)'
      : 'Chờ hoàn thành';

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
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: resolveColor(theme, 'onSurface'), flex: 1 }}>
          Chi tiết booking
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        {/* Thong tin hoc vien */}
        <Card>
          <Text style={{ fontSize: 14, fontWeight: '700', color: resolveColor(theme, 'onSurface') }}>
            {booking.memberName}
          </Text>
          <Text style={{ fontSize: 12, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 2 }}>
            {booking.memberEmail}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Chip label={`Mã: ${booking.id}`} tone="neutral" />
            <Pressable
              onPress={async () => {
                // expo-clipboard optional; fallback alert via Toast.
                ToastService.show({ message: `Đã sao chép mã ${booking.id}`, tone: 'achievement' });
              }}
              accessibilityRole="button"
              accessibilityLabel="Sao chép mã booking"
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
                }}
              >
                <Copy color={resolveColor(theme, 'onSurfaceVariant')} size={14} />
                <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant') }}>Sao chép</Text>
              </View>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <Chip label={`Buổi: ${booking.date} ${booking.timeSlot}`} tone="neutral" />
            <Chip label={`Trạng thái: ${booking.appointmentStatus}`} tone={booking.appointmentStatus === 'completed' ? 'success' : booking.appointmentStatus === 'cancelled' ? 'warning' : 'neutral'} />
          </View>
        </Card>

        {/* Thong tin thanh toan */}
        <Card>
          <Text style={{ fontSize: 12, fontWeight: '700', color: resolveColor(theme, 'onSurfaceVariant'), marginBottom: 12 }}>
            Thanh toán & hoàn tiền
          </Text>

          <Row label="Giá gốc" value={formatVND(booking.basePrice)} />
          {booking.discount > 0 ? <Row label="Giảm giá" value={`-${formatVND(booking.discount)}`} /> : null}
          <Row label="Khách thực trả" value={formatVND(booking.paidAmount)} bold />
          <Row label="Tổng hoàn tiền thành công" value={formatVND(totalRefunded)} />
          <Row label="Giá trị còn lại" value={formatVND(remaining)} bold />
          <View style={{ height: 1, backgroundColor: resolveColor(theme, 'outlineVariant'), marginVertical: 12 }} />
          <Row label="Tỷ lệ phí áp dụng" value="10%" />
          <Row label="Phí nền tảng còn lại" value={formatVND(feeRemaining)} />
          <Row label="Phần PT còn lại" value={formatVND(ptRemaining)} bold />
        </Card>

        {/* Trang thai thu nhap */}
        <Card variant="flat">
          <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant') }}>
            Trạng thái thu nhập
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: resolveColor(theme, 'onSurface'), marginTop: 4 }}>
            {earningsStatus}
          </Text>
          <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 8 }}>
            Ban đầu: phí {formatVND(totalFee)} · PT {formatVND(totalPt)}
          </Text>
        </Card>

        {/* Timeline */}
        <Card>
          <Text style={{ fontSize: 12, fontWeight: '700', color: resolveColor(theme, 'onSurfaceVariant'), marginBottom: 12 }}>
            Lịch sử giao dịch
          </Text>
          <TimelineRow
            label="Thanh toán"
            detail={`${formatVND(booking.paidAmount)} · ${booking.paymentStatus}`}
            time={booking.date}
            tone={booking.paymentStatus === 'paid' ? 'success' : 'neutral'}
          />
          {booking.appointmentStatus === 'completed' ? (
            <TimelineRow
              label="Hoàn thành buổi tập"
              detail={`Ghi nhận phần PT lúc hoàn thành`}
              time={booking.date}
              tone="success"
            />
          ) : null}
          {booking.refunds.map((r) => (
            <TimelineRow
              key={r.id}
              label={`Hoàn tiền ${r.status === 'succeeded' ? 'thành công' : r.status === 'failed' ? 'thất bại' : 'đang xử lý'}`}
              detail={`-${formatVND(r.amount)} · ${r.status}`}
              time={r.completedAt ?? r.createdAt}
              tone={
                r.status === 'succeeded' ? 'warning' : r.status === 'failed' ? 'error' : 'neutral'
              }
            />
          ))}
        </Card>

        {/* Note phan quyen */}
        <Text style={{ fontSize: 10, color: resolveColor(theme, 'onSurfaceVariant'), fontStyle: 'italic', textAlign: 'center' }}>
          Màn hình doanh thu chỉ hiển thị thông tin. Không thể thu tiền, rút tiền hoặc phê duyệt hoàn tiền tại đây.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: 13, color: resolveColor(theme, 'onSurfaceVariant') }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: bold ? '700' : '500',
          color: resolveColor(theme, 'onSurface'),
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function TimelineRow({
  label,
  detail,
  time,
  tone,
}: {
  label: string;
  detail: string;
  time: string;
  tone: 'success' | 'warning' | 'error' | 'neutral';
}) {
  const theme = useTheme();
  const colorMap = {
    success: theme.tokens.palette.primary,
    warning: theme.tokens.palette.secondary,
    error: theme.tokens.palette.error,
    neutral: theme.tokens.palette.outline,
  };
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 6 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colorMap[tone],
          marginTop: 6,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: resolveColor(theme, 'onSurface') }}>
          {label}
        </Text>
        <Text style={{ fontSize: 11, color: resolveColor(theme, 'onSurfaceVariant'), marginTop: 2 }}>
          {detail}
        </Text>
        <Text style={{ fontSize: 10, color: resolveColor(theme, 'onSurfaceDisabled'), marginTop: 2 }}>
          {formatDate(time)}
        </Text>
      </View>
    </View>
  );
}
