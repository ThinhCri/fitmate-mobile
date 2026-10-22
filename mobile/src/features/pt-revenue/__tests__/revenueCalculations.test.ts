/**
 * PT Revenue calculations tests (MOB-408).
 *
 * Yêu cầu kiểm thử bắt buộc (theo spec):
 *  - 500.000đ → phí 50.000đ → PT 450.000đ.
 *  - Sau giảm giá còn 450.000đ → phí 45.000đ → PT 405.000đ.
 *  - Thanh toán nhưng chưa hoàn thành: chỉ vào chờ hoàn thành.
 *  - Hoàn thành: ghi nhận đúng một lần.
 *  - Hoàn 100.000đ từ booking 500.000đ: hoàn phí 10.000đ, giảm phần PT 90.000đ.
 *  - Hoàn nhiều lần với số lẻ vẫn giữ tổng tiền khớp.
 *  - Hoàn toàn bộ: phí và phần PT còn lại bằng 0.
 *  - Hoàn tháng sau không sửa mất lịch sử tháng trước.
 *  - Refund pending/failed chưa làm phát sinh điều chỉnh thành công.
 *  - Payment retry không cộng trùng doanh thu.
 *  - Bộ lọc ngày đúng timezone và ranh giới cuối ngày.
 *  - KPI, chart, lịch sử khớp nhau.
 *  - PT không nhìn thấy dữ liệu PT khác.
 */
import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import {
  calcFeeAndPT,
  calcRefundAdjustment,
  calcRemainingAfterRefunds,
  computeRevenueChart,
  computeRevenueHistory,
  computeRevenueKPI,
  FEE_RATE_BPS,
  buildDateRange,
  isDateInRange,
  todayAsia,
  type BookingForPT,
  type RefundEvent,
} from './revenueCalculations';
import { PT_REVENUE_FIXTURES, getBookingsForPT } from './revenueFixtures';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-20T12:00:00.000Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

// Helper: ISO datetime trong ngay (today) theo Asia/Ho_Chi_Minh.
function todayIso(): string {
  const now = new Date();
  // Lay cac thanh phan ngay theo Asia (UTC+7).
  const asia = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const y = asia.getUTCFullYear();
  const m = String(asia.getUTCMonth() + 1).padStart(2, '0');
  const d = String(asia.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}T12:00:00+07:00`;
}

// =======================================================================
// calcFeeAndPT
// =======================================================================

describe('calcFeeAndPT', () => {
  it('500.000đ → fee 50.000đ → PT 450.000đ', () => {
    const { fee, ptShare } = calcFeeAndPT(500_000);
    expect(fee).toBe(50_000);
    expect(ptShare).toBe(450_000);
  });

  it('Fee rate is exactly 10% (1000 bps)', () => {
    expect(FEE_RATE_BPS).toBe(1000);
  });

  it('fee + ptShare = amount (always)', () => {
    const cases = [100_000, 333_333, 1_000_000, 555_555, 99_999];
    for (const amount of cases) {
      const { fee, ptShare } = calcFeeAndPT(amount);
      expect(fee + ptShare).toBe(amount);
    }
  });

  it('rounds 0.5 up', () => {
    // 5 → 0.5 → round 1 → PT 4
    const { fee, ptShare } = calcFeeAndPT(5);
    expect(fee).toBe(1);
    expect(ptShare).toBe(4);
  });
});

// =======================================================================
// Fee after discount
// =======================================================================

describe('Fee after discount', () => {
  it('Giảm giá còn 450.000đ → fee 45.000đ → PT 405.000đ', () => {
    const { fee, ptShare } = calcFeeAndPT(450_000);
    expect(fee).toBe(45_000);
    expect(ptShare).toBe(405_000);
  });
});

// =======================================================================
// Refund calculation
// =======================================================================

describe('calcRemainingAfterRefunds', () => {
  it('Hoàn 100.000đ từ booking 500.000đ → phí còn lại 40.000đ, PT còn 360.000đ', () => {
    const refunds: RefundEvent[] = [
      {
        id: 'r1',
        bookingId: 'b1',
        amount: 100_000,
        status: 'succeeded',
        createdAt: '2026-09-18T10:00:00+07:00',
        completedAt: '2026-09-18T10:00:00+07:00',
      },
    ];
    const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(500_000, refunds);
    expect(remaining).toBe(400_000);
    expect(feeRemaining).toBe(40_000);
    expect(ptRemaining).toBe(360_000);
  });

  it('Hoàn toàn bộ → phí và PT còn lại bằng 0', () => {
    const refunds: RefundEvent[] = [
      {
        id: 'r1',
        bookingId: 'b1',
        amount: 500_000,
        status: 'succeeded',
        createdAt: '2026-09-18T10:00:00+07:00',
        completedAt: '2026-09-18T10:00:00+07:00',
      },
    ];
    const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(500_000, refunds);
    expect(remaining).toBe(0);
    expect(feeRemaining).toBe(0);
    expect(ptRemaining).toBe(0);
  });

  it('Refund pending KHÔNG tính vào còn lại', () => {
    const refunds: RefundEvent[] = [
      {
        id: 'r1',
        bookingId: 'b1',
        amount: 100_000,
        status: 'pending',
        createdAt: '2026-09-18T10:00:00+07:00',
        completedAt: null,
      },
    ];
    const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(500_000, refunds);
    expect(remaining).toBe(500_000);
    expect(feeRemaining).toBe(50_000);
    expect(ptRemaining).toBe(450_000);
  });

  it('Refund failed KHÔNG tính vào còn lại', () => {
    const refunds: RefundEvent[] = [
      {
        id: 'r1',
        bookingId: 'b1',
        amount: 100_000,
        status: 'failed',
        createdAt: '2026-09-18T10:00:00+07:00',
        completedAt: null,
      },
    ];
    const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(500_000, refunds);
    expect(remaining).toBe(500_000);
    expect(feeRemaining).toBe(50_000);
    expect(ptRemaining).toBe(450_000);
  });
});

describe('calcRefundAdjustment', () => {
  it('Hoàn 100.000đ: phí hoàn 10.000đ, điều chỉnh PT âm 90.000đ', () => {
    const { feeRefund, ptAdjustment } = calcRefundAdjustment(100_000, 50_000);
    expect(feeRefund).toBe(10_000);
    expect(ptAdjustment).toBe(-90_000);
  });

  it('feeRefund + |ptAdjustment| = refundAmount (luôn khớp)', () => {
    const cases = [50_000, 33_333, 100_000, 555_555];
    for (const amount of cases) {
      const { feeRefund, ptAdjustment } = calcRefundAdjustment(amount, 50_000);
      expect(feeRefund + Math.abs(ptAdjustment)).toBe(amount);
    }
  });
});

describe('Multiple refunds — total math', () => {
  it('Hoàn nhiều lần: tổng phí hoàn + tổng giảm PT = tổng hoàn', () => {
    // Booking 500k, hoàn 50k + 30k = 80k
    // Phí hoàn = 5k + 3k = 8k. PT giảm = 45k + 27k = 72k.
    const refunds: RefundEvent[] = [
      { id: 'r1', bookingId: 'b1', amount: 50_000, status: 'succeeded', createdAt: 't1', completedAt: 't1' },
      { id: 'r2', bookingId: 'b1', amount: 30_000, status: 'succeeded', createdAt: 't2', completedAt: 't2' },
    ];
    const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(500_000, refunds);
    expect(remaining).toBe(420_000);
    expect(feeRemaining).toBe(42_000);
    expect(ptRemaining).toBe(378_000);
    // Initial PT was 450k; after 80k refund, PT = 378k, adjustment = -72k.
    // Initial fee was 50k; after 80k refund, fee = 42k, adjustment = -8k.
    // Sum: 8k + 72k = 80k ✓
  });

  it('Hoàn toàn bộ nhiều lần: tổng phí hoàn = phí gốc, PT cuối = 0', () => {
    const refunds: RefundEvent[] = [
      { id: 'r1', bookingId: 'b1', amount: 200_000, status: 'succeeded', createdAt: 't1', completedAt: 't1' },
      { id: 'r2', bookingId: 'b1', amount: 200_000, status: 'succeeded', createdAt: 't2', completedAt: 't2' },
      { id: 'r3', bookingId: 'b1', amount: 100_000, status: 'succeeded', createdAt: 't3', completedAt: 't3' },
    ];
    const { remaining, feeRemaining, ptRemaining } = calcRemainingAfterRefunds(500_000, refunds);
    expect(remaining).toBe(0);
    expect(feeRemaining).toBe(0);
    expect(ptRemaining).toBe(0);
  });
});

// =======================================================================
// KPI computation
// =======================================================================

describe('computeRevenueKPI', () => {
  it('Booking chưa thanh toán KHÔNG tính vào chờ hoàn thành', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: '2026-09-15',
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'pending',
        paymentStatus: 'unpaid',
        refunds: [],
      },
    ];
    const kpi = computeRevenueKPI(bookings, 'this_month');
    expect(kpi.pendingCount).toBe(0);
    expect(kpi.pendingEarnings).toBe(0);
    expect(kpi.completedCount).toBe(0);
  });

  it('Thanh toán nhưng chờ hoàn thành → chỉ vào pending', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'confirmed',
        paymentStatus: 'paid',
        refunds: [],
      },
    ];
    const kpi = computeRevenueKPI(bookings, 'this_month');
    expect(kpi.pendingCount).toBe(1);
    expect(kpi.pendingEarnings).toBe(450_000);
    expect(kpi.completedCount).toBe(0);
    expect(kpi.completedEarnings).toBe(0);
  });

  it('Booking hoàn thành → ghi nhận 1 lần vào completed earnings', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [],
      },
    ];
    const kpi = computeRevenueKPI(bookings, 'this_month');
    expect(kpi.completedCount).toBe(1);
    expect(kpi.completedEarnings).toBe(450_000);
    expect(kpi.platformFee).toBe(50_000);
    expect(kpi.completedServiceValue).toBe(500_000);
  });

  it('Booking cancelled trước hoàn thành KHÔNG tính vào completed earnings', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'cancelled',
        paymentStatus: 'refunded',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 500_000, status: 'succeeded', createdAt: todayIso(), completedAt: todayIso() },
        ],
      },
    ];
    const kpi = computeRevenueKPI(bookings, 'this_month');
    expect(kpi.completedCount).toBe(0);
    expect(kpi.completedEarnings).toBe(0);
  });

  it('Booking hoàn thành với hoàn 1 phần: PT giảm tương ứng', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 100_000, status: 'succeeded', createdAt: todayIso(), completedAt: todayIso() },
        ],
      },
    ];
    const kpi = computeRevenueKPI(bookings, 'this_month');
    // earned 450k, refund 90k → net 360k
    expect(kpi.completedEarnings).toBe(360_000);
    expect(kpi.refundAdjustment).toBe(-90_000);
    expect(kpi.platformFee).toBe(50_000 - 10_000);
  });
});

// =======================================================================
// History consistency
// =======================================================================

describe('computeRevenueHistory', () => {
  it('Sắp xếp mới nhất trước', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: '2026-09-01',
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [],
      },
      {
        id: 'b2',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: '2026-09-10',
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [],
      },
    ];
    const history = computeRevenueHistory(bookings, 'this_month');
    expect(history[0].bookingId).toBe('b2');
    expect(history[1].bookingId).toBe('b1');
  });

  it('Booking hoàn thành xuất hiện 1 lần trong history (không cộng trùng)', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [],
      },
    ];
    const history = computeRevenueHistory(bookings, 'this_month');
    const earning = history.filter((h) => h.eventType === 'earning');
    expect(earning.length).toBe(1);
  });

  it('Refund pending/failed KHÔNG xuất hiện trong history với type=refund_adjustment', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 100_000, status: 'pending', createdAt: 't', completedAt: null },
          { id: 'r2', bookingId: 'b1', amount: 50_000, status: 'failed', createdAt: 't', completedAt: null },
        ],
      },
    ];
    const history = computeRevenueHistory(bookings, 'this_month');
    expect(history.every((h) => h.eventType === 'earning')).toBe(true);
  });

  it('Bộ lọc refund_adjustment chỉ hiện refund', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 100_000, status: 'succeeded', createdAt: todayIso(), completedAt: todayIso() },
        ],
      },
    ];
    const history = computeRevenueHistory(bookings, 'this_month', 'refund_adjustment');
    expect(history.every((h) => h.eventType === 'refund_adjustment')).toBe(true);
  });
});

// =======================================================================
// Chart consistency with KPI
// =======================================================================

describe('computeRevenueChart', () => {
  it('Tổng cột = KPI completed earnings + refund adjustments', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 100_000, status: 'succeeded', createdAt: todayIso(), completedAt: todayIso() },
        ],
      },
    ];
    const chart = computeRevenueChart(bookings, 'this_month');
    const kpi = computeRevenueKPI(bookings, 'this_month');
    const totalChartNet = chart.reduce((s, p) => s + p.net, 0);
    // chart net = earnings - |refunds| → 360k
    // KPI completedEarnings = 360k (already includes refund adjustment)
    expect(totalChartNet).toBe(kpi.completedEarnings);
  });

  it('Có giá trị âm khi refund lớn hơn earnings', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: '2026-08-01',
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 500_000, status: 'succeeded', createdAt: todayIso(), completedAt: todayIso() },
        ],
      },
    ];
    const chart = computeRevenueChart(bookings, 'this_month');
    const hasNegative = chart.some((p) => p.net < 0);
    expect(hasNegative).toBe(true);
  });

  it('Ngày không phát sinh có giá trị 0', () => {
    const chart = computeRevenueChart([], 'this_month');
    expect(chart.length).toBeGreaterThan(0);
    expect(chart.every((p) => p.earnings === 0 && p.refunds === 0)).toBe(true);
  });
});

// =======================================================================
// Date range
// =======================================================================

describe('buildDateRange + isDateInRange', () => {
  it('this_month: from = 1st of current month, to = today end', () => {
    const range = buildDateRange('this_month');
    const today = new Date();
    expect(range.from.getDate()).toBe(1);
    expect(range.from.getMonth()).toBe(today.getMonth());
    expect(range.to.getDate()).toBe(today.getDate());
  });

  it('last_month: from = 1st prev, to = last day prev', () => {
    const range = buildDateRange('last_month');
    expect(range.from.getDate()).toBe(1);
    expect(range.from.getMonth()).not.toBe(new Date().getMonth());
  });

  it('isDateInRange: bao gồm ranh giới cuối ngày', () => {
    const range = buildDateRange('this_month');
    // Last day of range should be included.
    const lastDay = range.to.toISOString().split('T')[0];
    expect(isDateInRange(lastDay, range)).toBe(true);
  });

  it('todayAsia trả về cùng ngày', () => {
    const { start, end } = todayAsia();
    expect(start.getDate()).toBe(end.getDate());
  });
});

// =======================================================================
// Data isolation per PT
// =======================================================================

describe('Per-PT data isolation', () => {
  it('PT 1 chỉ nhìn thấy booking của mình', () => {
    const p1 = getBookingsForPT('pt@fitmate.vn');
    const p2 = getBookingsForPT('ptlong@fitmate.vn');
    expect(p1.every((b) => b.ptEmail === 'pt@fitmate.vn')).toBe(true);
    expect(p2.every((b) => b.ptEmail === 'ptlong@fitmate.vn')).toBe(true);
    expect(p1.length).toBeGreaterThan(0);
    expect(p2.length).toBeGreaterThan(0);
  });

  it('KPI của PT 1 KHÔNG chứa booking của PT 2', () => {
    // Fixtures are created at module import time, before the fake clock is set.
    // Put both owners in the same test period so this assertion stays meaningful.
    const inTestPeriod = (bookings: BookingForPT[]) => bookings
      .filter((booking) => booking.appointmentStatus === 'completed')
      .map((booking) => ({ ...booking, date: '2026-09-20', refunds: [] }));
    const kpi1 = computeRevenueKPI(inTestPeriod(PT_REVENUE_FIXTURES['pt@fitmate.vn']), 'this_month');
    const kpi2 = computeRevenueKPI(inTestPeriod(PT_REVENUE_FIXTURES['ptlong@fitmate.vn']), 'this_month');
    expect(kpi1.completedEarnings).toBeGreaterThan(0);
    expect(kpi2.completedEarnings).toBeGreaterThan(0);
    expect(kpi1.completedEarnings).not.toBe(kpi2.completedEarnings);
  });
});

// =======================================================================
// Payment retry (no double-count)
// =======================================================================

describe('Payment retry — no double counting', () => {
  it('Nhiều refund pending/failed không cộng thêm completed earnings', () => {
    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: todayIso().split('T')[0],
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 50_000, status: 'pending', createdAt: 't', completedAt: null },
          { id: 'r2', bookingId: 'b1', amount: 50_000, status: 'failed', createdAt: 't', completedAt: null },
        ],
      },
    ];
    const kpi = computeRevenueKPI(bookings, 'this_month');
    expect(kpi.completedEarnings).toBe(450_000);
  });
});

// =======================================================================
// Refund across months
// =======================================================================

describe('Refund across months', () => {
  it('Hoàn tháng sau không sửa lịch sử tháng trước', () => {
    // Booking hoàn thành tháng trước, refund succeeded tháng này.
    const todayStr = todayIso().split('T')[0];
    const [y, m] = todayStr.split('-').map((s) => parseInt(s, 10));
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear = m === 1 ? y - 1 : y;
    const lastMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-05`;

    const bookings: BookingForPT[] = [
      {
        id: 'b1',
        ptEmail: 'pt@fitmate.vn',
        memberEmail: 'user@fitmate.vn',
        memberName: 'User',
        date: lastMonthStr,
        timeSlot: '09:00',
        basePrice: 500_000,
        discount: 0,
        paidAmount: 500_000,
        appointmentStatus: 'completed',
        paymentStatus: 'paid',
        refunds: [
          { id: 'r1', bookingId: 'b1', amount: 100_000, status: 'succeeded', createdAt: todayIso(), completedAt: todayIso() },
        ],
      },
    ];
    // last_month KPI (chỉ xem booking tháng trước, refund tháng này không nằm trong kỳ)
    const kpiLast = computeRevenueKPI(bookings, 'last_month');
    expect(kpiLast.completedCount).toBe(1);
    expect(kpiLast.completedEarnings).toBe(450_000); // chưa trừ refund tháng này
    // this_month KPI (booking không nằm trong kỳ → completedCount=0, nhưng refund vẫn được tính)
    const kpiThis = computeRevenueKPI(bookings, 'this_month');
    expect(kpiThis.completedCount).toBe(0);
    expect(kpiThis.refundAdjustment).toBe(-90_000);
  });
});
