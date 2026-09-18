/**
 * PT Revenue — types + calculations (MOB-408).
 *
 * Chinh sach da chot (2026-09-18):
 *  - Phí nền tảng: 10% của số tiền thực trả (sau giảm giá).
 *    Tính = Math.round(amount * 0.10). PT nhận phần còn lại.
 *  - Giảm giá: giảm từ giá gốc trước, phí tính trên số thực trả.
 *  - Thời điểm ghi nhận: khi booking status = 'completed'.
 *  - Hoàn tiền: điều chỉnh âm vào thu nhập tại thời điểm refund succeeded.
 *  - Nhiều lần hoàn: tính phí còn lại từ số tiền thực trả còn lại.
 *  - Làm tròn: Math.round (0.5 lên). Tổng phí + PT luôn khớp số tiền gốc.
 *
 * IMPORTANT: Day la mock data + tinh toan phia client cho demo.
 * Khi tich hop backend thuc: backend la nguon tham quyen ve gia,
 * phi, trang thai thanh toan va lich su giao dich.
 */
import type { User } from '@/types';

// -----------------------------------------------------------------------
// Booking / Payment types
// -----------------------------------------------------------------------

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunding' | 'refunded';
export type BookingForPT = {
  id: string;
  ptEmail: string;
  memberEmail: string;
  memberName: string;
  date: string; // ISO date YYYY-MM-DD
  timeSlot: string;
  /** Giá gốc trước giảm giá (VND). */
  basePrice: number;
  /** Giảm giá (VND). */
  discount: number;
  /** Số tiền thực trả = basePrice - discount. */
  paidAmount: number;
  /** Trạng thái booking (Appointment.status). */
  appointmentStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'late' | 'rescheduled';
  paymentStatus: PaymentStatus;
  /** Danh sach refund events. */
  refunds: RefundEvent[];
};

export type RefundEvent = {
  id: string;
  bookingId: string;
  amount: number; // VND đã hoàn
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: string; // ISO datetime
  completedAt: string | null; // ISO datetime when status became 'succeeded'
};

// -----------------------------------------------------------------------
// Revenue calculation types
// -----------------------------------------------------------------------

/** Tỷ lệ phí nền tảng: 10% = 1000 basis points. */
export const FEE_RATE_BPS = 1000;
export const FEE_RATE = FEE_RATE_BPS / 10000; // 0.10

/**
 * Tính phí nền tảng và phần PT từ số tiền đã thanh toán.
 * Phí = round(amount × 10%), PT = amount - phí.
 * Làm tròn 0.5 lên để tổng luôn khớp.
 */
export function calcFeeAndPT(amount: number): { fee: number; ptShare: number } {
  const fee = Math.round(amount * FEE_RATE);
  const ptShare = amount - fee;
  return { fee, ptShare };
}

/**
 * Tính phần PT còn lại và phí còn lại sau khi trừ tổng hoàn tiền thành công.
 * Số tiền hoàn = sum(succeeded refunds).
 * remaining = paidAmount - totalRefunded.
 * fee_remaining = round(remaining × 10%).
 * pt_remaining = remaining - fee_remaining.
 */
export function calcRemainingAfterRefunds(
  paidAmount: number,
  refunds: RefundEvent[],
): { remaining: number; feeRemaining: number; ptRemaining: number } {
  const totalRefunded = refunds
    .filter((r) => r.status === 'succeeded')
    .reduce((sum, r) => sum + r.amount, 0);
  const remaining = paidAmount - totalRefunded;
  const { fee: feeRemaining, ptShare: ptRemaining } = calcFeeAndPT(Math.max(0, remaining));
  return { remaining: Math.max(0, remaining), feeRemaining, ptRemaining };
}

/**
 * Tính điều chỉnh hoàn tiền cho một refund event thành công.
 * Điều chỉnh PT = -(tiền hoàn - phí hoàn).
 * Phí hoàn lại = round(refundAmount × 10%).
 * Điều chỉnh PT âm (giảm thu nhập).
 *
 * Voi nhieu lan hoan:
 *  - Mỗi lần tính từ phí còn lại trước lần hoàn đó.
 *  - Tổng điều chỉnh bằng tổng phần PT đã ghi nhận từ booking.
 *  - Khong lam cham phí tong.
 */
export function calcRefundAdjustment(
  refundAmount: number,
  feeRemainingBefore: number,
): { feeRefund: number; ptAdjustment: number } {
  // Phí hoàn lại = phần tương ứng của refund trên phí còn lại.
  // Cách đơn giản: round(refundAmount × 10%) như tính gốc.
  // Đây đảm bảo tổng phí hoàn = tổng phí gốc (vì 10% × tổng refund = tổng phí refund).
  const feeRefund = Math.round(refundAmount * FEE_RATE);
  // ptAdjustment ÂM (là khoản trừ thu nhập).
  const ptAdjustment = -(refundAmount - feeRefund);
  void feeRemainingBefore;
  return { feeRefund, ptAdjustment };
}

// -----------------------------------------------------------------------
// Revenue aggregation
// -----------------------------------------------------------------------

export type RevenuePeriod = 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export interface DateRange {
  from: Date;
  to: Date; // inclusive end of day
}

/** Returns start and end of today in Asia/Ho_Chi_Minh timezone. */
export function todayAsia(): { start: Date; end: Date } {
  // Use local time as if it were Asia/Ho_Chi_Minh (UTC+7) for demo.
  const now = new Date();
  const offset = 7 * 60;
  const localOffset = -now.getTimezoneOffset();
  const diffMinutes = offset - localOffset;
  const start = new Date(now.getTime() + diffMinutes * 60000);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

/**
 * Format a Date as YYYY-MM-DD theo Asia/Ho_Chi_Minh (UTC+7), khong phu thuoc may local.
 * Dam bao cac logic khop nhau qua cac timezone may khac nhau (CI, Linux, Windows).
 */
export function formatDateKeyAsia(d: Date): string {
  // Convert to Asia/Ho_Chi_Minh (UTC+7) by adding 7h offset.
  const asia = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const y = asia.getUTCFullYear();
  const m = String(asia.getUTCMonth() + 1).padStart(2, '0');
  const day = String(asia.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Extract YYYY-MM-DD date key tu ISO datetime theo Asia (UTC+7).
 * Dam bao cac moc thoi gian deu quy ve cung ngay calendar Asia.
 */
export function dateKeyFromISO(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    // Fallback: split 'T' phan dau, chap nhan cho test don gian.
    return iso.split('T')[0] ?? '';
  }
  return formatDateKeyAsia(d);
}

/**
 * Build a DateRange from a RevenuePeriod selector.
 * - 'this_month': 1st of current month → end of today.
 * - 'last_month': 1st of previous month → last day of previous month.
 * - 'last_3_months': 1st of month 2 months ago → end of today.
 */
export function buildDateRange(period: RevenuePeriod): DateRange {
  const { start: todayStart, end: todayEnd } = todayAsia();
  const year = todayStart.getFullYear();
  const month = todayStart.getMonth(); // 0-based

  if (period === 'this_month') {
    return {
      from: new Date(year, month, 1),
      to: todayEnd,
    };
  }

  if (period === 'last_month') {
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const lastDay = new Date(prevYear, prevMonth + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return {
      from: new Date(prevYear, prevMonth, 1),
      to: lastDay,
    };
  }

  if (period === 'last_3_months') {
    const month2 = month - 2;
    const fromYear = month2 < 0 ? year - 1 : year;
    const fromMonth = ((month2 % 12) + 12) % 12;
    return {
      from: new Date(fromYear, fromMonth, 1),
      to: todayEnd,
    };
  }

  // Default: this month
  return {
    from: new Date(year, month, 1),
    to: todayEnd,
  };
}

/** Check if a date string (YYYY-MM-DD) falls within a DateRange (inclusive). */
export function isDateInRange(dateStr: string, range: DateRange): boolean {
  // Parse YYYY-MM-DD roi so sanh theo timestamp cua local midnight.
  // Voi dateStr o Asia (UTC+7): YYYY-MM-DD = ngay trong Asia.
  // Convert sang Date local: new Date(yyyy, mm-1, dd) cung la local midnight.
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const [y, m, d] = parts.map((s) => parseInt(s, 10));
  const dDate = new Date(y, m - 1, d);
  return dDate.getTime() >= range.from.getTime() && dDate.getTime() <= range.to.getTime();
}

/**
 * Revenue KPI snapshot for a given PT and period.
 * - completedEarnings: tổng phần PT đã ghi nhận (completed trong kỳ).
 * - completedServiceValue: tổng paidAmount đã hoàn thành trong kỳ.
 * - platformFee: tổng phí ghi nhận trong kỳ.
 * - refundAdjustment: tổng điều chỉnh hoàn tiền trong kỳ (âm).
 * - completedCount: số booking đã hoàn thành trong kỳ.
 * - pendingCount: số booking đã thanh toán chưa hoàn thành (hiện tại, không theo kỳ).
 * - pendingEarnings: phần PT dự kiến từ các booking chờ hoàn thành.
 */
export interface RevenueKPI {
  completedEarnings: number; // VND, tổng phần PT (sau phí, sau điều chỉnh hoàn)
  completedServiceValue: number; // VND, tổng paidAmount
  platformFee: number; // VND, tổng phí đã ghi nhận
  refundAdjustment: number; // VND, điều chỉnh hoàn tiền (âm)
  completedCount: number;
  pendingCount: number;
  pendingEarnings: number; // VND, phần PT dự kiến chờ hoàn thành
}

/**
 * Một mục trong lịch sử thu nhập.
 * Phân biệt loại: 'earning' (ghi nhận hoàn thành) vs 'refund_adjustment' (điều chỉnh hoàn).
 */
export type RevenueHistoryItem = {
  id: string;
  bookingId: string;
  eventType: 'earning' | 'refund_adjustment';
  /** Mô tả ngắn. */
  description: string;
  memberName: string;
  /** Thời gian sự kiện. */
  eventAt: string; // ISO datetime
  /** Phần PT thay đổi: dương cho earning, âm cho refund. */
  ptChange: number; // VND
  /** Trạng thái booking tại thời điểm sự kiện. */
  bookingStatus: string;
  /** Số tiền thực trả của booking. */
  paidAmount: number;
};

/**
 * Một cột trong biểu đồ thu nhập theo thời gian.
 * X = ngày (hoặc tuần), Y = tổng phần PT ghi nhận trong kỳ đó.
 */
export interface RevenueChartPoint {
  label: string; // e.g. "01/10" or "Tuần 1"
  period: string; // YYYY-MM-DD for sorting
  earnings: number; // VND
  refunds: number; // VND (âm, điều chỉnh hoàn)
  net: number; // earnings + refunds
}

// -----------------------------------------------------------------------
// Revenue computation from booking list
// -----------------------------------------------------------------------

/**
 * Tính KPI từ danh sách booking của PT.
 *
 * Chính sách (xem spec phần 3):
 *  - completedEarnings: tổng phần PT được ghi nhận khi hoàn thành trong kỳ,
 *    TRỪ đi phần PT bị điều chỉnh bởi refund có completedAt trong cùng kỳ.
 *    → Đảm bảo "Hoàn tháng sau không sửa mất lịch sử tháng trước".
 *  - refundAdjustment: tổng điều chỉnh hoàn tiền có completedAt trong kỳ (âm).
 *  - platformFee: phí ghi nhận trong kỳ = phí booking hoàn thành - phí còn lại sau refund trong kỳ.
 */
export function computeRevenueKPI(
  bookings: BookingForPT[],
  period: RevenuePeriod,
): RevenueKPI {
  const range = buildDateRange(period);

  // Completed bookings in period
  const completed = bookings.filter(
    (b) =>
      b.appointmentStatus === 'completed' &&
      isDateInRange(b.date, range),
  );

  // Refunds in period (succeeded only)
  const refundsInPeriod = bookings.flatMap((b) =>
    b.refunds
      .filter((r) => r.status === 'succeeded' && r.completedAt && isDateInRange(dateKeyFromISO(r.completedAt), range)),
  );

  // refundAdjustment = sum of ptAdjustment for each in-period refund
  const refundAdjustment = refundsInPeriod.reduce((sum, r) => {
    const booking = bookings.find((b) => b.id === r.bookingId);
    if (!booking) return sum;
    // Phí còn lại TRƯỚC lần refund này (chỉ tính các refund trước đó).
    const otherSucceeded = booking.refunds.filter(
      (ref) => ref.status === 'succeeded' && ref.id !== r.id && ref.completedAt && ref.completedAt < r.completedAt!,
    );
    const { feeRemaining: feeBefore } = calcRemainingAfterRefunds(
      booking.paidAmount,
      otherSucceeded,
    );
    const { ptAdjustment } = calcRefundAdjustment(r.amount, feeBefore);
    return sum + ptAdjustment;
  }, 0);

  // completedEarnings: pt share net of refunds whose completedAt is in the same period.
  // Chỉ trừ refund có completedAt TRONG KỲ hiện tại.
  // Refund ngoài kỳ → không ảnh hưởng kỳ hiện tại.
  const completedEarnings = completed.reduce((sum, b) => {
    const { ptShare: totalPt } = calcFeeAndPT(b.paidAmount);
    const inPeriodRefunds = b.refunds.filter(
      (r) => r.status === 'succeeded' && r.completedAt && isDateInRange(dateKeyFromISO(r.completedAt), range),
    );
    let ptRefundInPeriod = 0;
    let remainingFee = calcFeeAndPT(b.paidAmount).fee;
    const sortedRefunds = [...inPeriodRefunds].sort((a, c) => (a.completedAt ?? '').localeCompare(c.completedAt ?? ''));
    for (const r of sortedRefunds) {
      const { feeRefund, ptAdjustment } = calcRefundAdjustment(r.amount, remainingFee);
      ptRefundInPeriod += ptAdjustment;
      remainingFee -= feeRefund;
    }
    return sum + totalPt + ptRefundInPeriod;
  }, 0);

  // platformFee: phí ghi nhận trong kỳ - phí bị hoàn tương ứng trong kỳ.
  // Phí ghi nhận trong kỳ = phí của booking hoàn thành trong kỳ (= 50k cho booking 500k).
  // Phí bị hoàn = phí tổng - phí còn lại sau refund trong kỳ.
  // Ví dụ booking 500k hoàn 100k trong kỳ:
  //   - Phí tổng = 50k, phí còn lại = 40k → phí bị hoàn = 10k.
  //   - platformFee = 50k - 10k = 40k.
  const platformFee = completed.reduce((sum, b) => {
    const { fee: totalFee } = calcFeeAndPT(b.paidAmount);
    const inPeriodRefunds = b.refunds.filter(
      (r) => r.status === 'succeeded' && r.completedAt && isDateInRange(dateKeyFromISO(r.completedAt), range),
    );
    if (inPeriodRefunds.length === 0) return sum + totalFee;
    const { feeRemaining } = calcRemainingAfterRefunds(b.paidAmount, inPeriodRefunds);
    const feeRefundedInPeriod = totalFee - feeRemaining;
    return sum + (totalFee - feeRefundedInPeriod);
  }, 0);

  const completedServiceValue = completed.reduce((sum, b) => sum + b.paidAmount, 0);

  // Pending (paid but not completed, not cancelled)
  const pending = bookings.filter(
    (b) =>
      b.paymentStatus === 'paid' &&
      b.appointmentStatus !== 'completed' &&
      b.appointmentStatus !== 'cancelled' &&
      b.appointmentStatus !== 'rescheduled',
  );
  const pendingEarnings = pending.reduce((sum, b) => {
    const { ptRemaining } = calcRemainingAfterRefunds(b.paidAmount, b.refunds);
    return sum + ptRemaining;
  }, 0);

  return {
    completedEarnings,
    completedServiceValue,
    platformFee,
    refundAdjustment,
    completedCount: completed.length,
    pendingCount: pending.length,
    pendingEarnings,
  };
}

/**
 * Tính lịch sử thu nhập từ danh sách booking.
 */
export function computeRevenueHistory(
  bookings: BookingForPT[],
  period: RevenuePeriod,
  eventFilter?: 'all' | 'earning' | 'refund_adjustment',
): RevenueHistoryItem[] {
  const range = buildDateRange(period);
  const items: RevenueHistoryItem[] = [];

  // Earnings: completed bookings in period
  if (!eventFilter || eventFilter === 'all' || eventFilter === 'earning') {
    for (const b of bookings) {
      if (b.appointmentStatus !== 'completed') continue;
      if (!isDateInRange(b.date, range)) continue;
      const { feeRemaining, ptRemaining } = calcRemainingAfterRefunds(b.paidAmount, b.refunds);
      const { fee: totalFee } = calcFeeAndPT(b.paidAmount);
      const paidFee = totalFee - feeRemaining;
      items.push({
        id: `earn-${b.id}`,
        bookingId: b.id,
        eventType: 'earning',
        description: 'Ghi nhận hoàn thành',
        memberName: b.memberName,
        eventAt: b.date + 'T12:00:00+07:00',
        ptChange: ptRemaining,
        bookingStatus: b.appointmentStatus,
        paidAmount: b.paidAmount,
      });
      void paidFee;
    }
  }

  // Refund adjustments: succeeded refunds in period
  if (!eventFilter || eventFilter === 'all' || eventFilter === 'refund_adjustment') {
    for (const b of bookings) {
      for (const r of b.refunds) {
        if (r.status !== 'succeeded') continue;
        const dateStr = dateKeyFromISO(r.completedAt ?? '');
        if (!isDateInRange(dateStr, range)) continue;
        const otherSucceeded = b.refunds.filter(
          (ref) => ref.status === 'succeeded' && ref.id !== r.id && ref.completedAt && ref.completedAt < r.completedAt!,
        );
        const { feeRemaining: feeBefore } = calcRemainingAfterRefunds(
          b.paidAmount,
          otherSucceeded,
        );
        const { ptAdjustment } = calcRefundAdjustment(r.amount, feeBefore);
        items.push({
          id: `ref-${r.id}`,
          bookingId: b.id,
          eventType: 'refund_adjustment',
          description: 'Điều chỉnh hoàn tiền',
          memberName: b.memberName,
          eventAt: r.completedAt ?? r.createdAt,
          ptChange: ptAdjustment,
          bookingStatus: b.appointmentStatus,
          paidAmount: b.paidAmount,
        });
      }
    }
  }

  // Sort newest first
  items.sort((a, b) => b.eventAt.localeCompare(a.eventAt));
  return items;
}

/**
 * Tính dữ liệu biểu đồ theo ngày cho một khoảng thời gian.
 * Trả về mảng RevenueChartPoint, mỗi điểm = 1 ngày.
 * - earnings: phần PT ghi nhận khi booking hoàn thành trong ngày (date booking).
 * - refunds: điều chỉnh phần PT khi refund succeeded trong ngày (date refund).
 * - net: earnings + refunds.
 */
export function computeRevenueChart(
  bookings: BookingForPT[],
  period: RevenuePeriod,
): RevenueChartPoint[] {
  const range = buildDateRange(period);
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayMap: Record<string, { earnings: number; refunds: number }> = {};

  // Completed earnings (theo ngày booking).
  for (const b of bookings) {
    if (b.appointmentStatus !== 'completed') continue;
    if (!isDateInRange(b.date, range)) continue;
    const { ptShare: totalPt } = calcFeeAndPT(b.paidAmount);
    // Trừ refund có completedAt trong CÙNG kỳ.
    const inPeriodRefunds = b.refunds.filter(
      (r) => r.status === 'succeeded' && r.completedAt && isDateInRange(dateKeyFromISO(r.completedAt), range),
    );
    let ptRefundInPeriod = 0;
    let remainingFee = calcFeeAndPT(b.paidAmount).fee;
    for (const r of [...inPeriodRefunds].sort((a, c) => (a.completedAt ?? '').localeCompare(c.completedAt ?? ''))) {
      const { feeRefund, ptAdjustment } = calcRefundAdjustment(r.amount, remainingFee);
      void feeRefund;
      ptRefundInPeriod += ptAdjustment;
      remainingFee -= feeRefund;
    }
    const dateStr = b.date;
    if (!dayMap[dateStr]) dayMap[dateStr] = { earnings: 0, refunds: 0 };
    dayMap[dateStr].earnings += totalPt + ptRefundInPeriod;
  }

  // Refund adjustments (theo ngày refund).
  for (const b of bookings) {
    for (const r of b.refunds) {
      if (r.status !== 'succeeded') continue;
      const dateStr = dateKeyFromISO(r.completedAt ?? r.createdAt);
      if (!isDateInRange(dateStr, range)) continue;
      const otherSucceeded = b.refunds.filter(
        (ref) => ref.status === 'succeeded' && ref.id !== r.id && ref.completedAt && ref.completedAt < r.completedAt!,
      );
      const { feeRemaining: feeBefore } = calcRemainingAfterRefunds(b.paidAmount, otherSucceeded);
      const { ptAdjustment } = calcRefundAdjustment(r.amount, feeBefore);
      if (!dayMap[dateStr]) dayMap[dateStr] = { earnings: 0, refunds: 0 };
      // Chỉ ghi nhận refund nếu booking hoàn thành không có earnings cùng ngày
      // (để tránh double-count). Nếu booking cùng ngày có earnings đã trừ refund rồi,
      // ta KHÔNG add lại refund vào dayMap.
      // Logic đơn giản: nếu dateStr là ngày booking và booking completed trong kỳ,
      // ta sẽ trừ refund ở phần earnings → KHÔNG add refund vào dayMap ở đây.
      const completedSameDay = b.appointmentStatus === 'completed' && b.date === dateStr;
      if (!completedSameDay) {
        dayMap[dateStr].refunds += ptAdjustment;
      }
    }
  }

  // Fill all days in range
  const days: RevenueChartPoint[] = [];
  let cursor = new Date(range.from);
  cursor.setHours(0, 0, 0, 0);
  const endMs = range.to.getTime();
  while (cursor.getTime() <= endMs) {
    // Use local date components to format date key.
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const today = dayMap[dateStr] ?? { earnings: 0, refunds: 0 };
    const day = String(cursor.getDate()).padStart(2, '0');
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    days.push({
      label: `${day}/${month}`,
      period: dateStr,
      earnings: today.earnings,
      refunds: today.refunds,
      net: today.earnings + today.refunds,
    });
    cursor = new Date(cursor.getTime() + msPerDay);
  }

  return days;
}

/**
 * Check whether a user can access PT revenue data.
 */
export function canAccessRevenue(user: User | null): boolean {
  return user !== null && user.profile.isPt === true;
}
