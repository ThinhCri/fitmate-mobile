/**
 * PT Revenue fixtures (MOB-408).
 *
 * Cố định, có liên kết hợp lý, dùng để demo các case:
 *  - Booking đã thanh toán chờ hoàn thành.
 *  - Booking hoàn thành.
 *  - Booking chưa thanh toán.
 *  - Booking có giảm giá.
 *  - Hủy và hoàn toàn bộ trước hoàn thành.
 *  - Hoàn một phần sau hoàn thành.
 *  - Nhiều lần hoàn tiền.
 *  - Hoàn tiền khác tháng với tháng ghi nhận thu nhập.
 *  - Refund pending/failed.
 *  - Khoảng trống và kỳ có thu nhập âm.
 *
 * Ngày tháng dùng ISO date YYYY-MM-DD; dữ liệu ổn định qua các lần render
 * để KPI, chart, history luôn khớp nhau.
 */

import type { BookingForPT, RefundEvent } from './revenueCalculations';

// Helper: ISO date N days ago
function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function isoTime(date: string, hour = 12, minute = 0): string {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`;
}

// =======================================================================
// PT 1: Mai Xuân Tú (pt@fitmate.vn) — verified, nhiều case hoàn thành
// =======================================================================

const p1Bookings: BookingForPT[] = [
  // 1. Đã hoàn thành, không hoàn tiền — booking tuần trước
  {
    id: 'bk-p1-001',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'user@fitmate.vn',
    memberName: 'Nguyễn Văn Hùng',
    date: daysAgo(7),
    timeSlot: '09:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [],
  },
  // 2. Đã hoàn thành, có giảm giá — booking 2 tuần trước
  {
    id: 'bk-p1-002',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'minh@fitmate.vn',
    memberName: 'Trần Quang Minh',
    date: daysAgo(14),
    timeSlot: '10:00',
    basePrice: 500000,
    discount: 50000,
    paidAmount: 450000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [],
  },
  // 3. Đã hoàn thành, có hoàn 100.000đ (một phần) — booking 5 ngày trước
  {
    id: 'bk-p1-003',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'hoa@fitmate.vn',
    memberName: 'Lê Thị Hoa',
    date: daysAgo(5),
    timeSlot: '14:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [
      {
        id: 'rf-p1-003-01',
        bookingId: 'bk-p1-003',
        amount: 100000,
        status: 'succeeded',
        createdAt: isoTime(daysAgo(4)),
        completedAt: isoTime(daysAgo(3)),
      },
    ],
  },
  // 4. Đã hoàn thành, nhiều lần hoàn — booking 20 ngày trước
  // Hoàn 50.000đ (pending, không tính), rồi 30.000đ (succeeded) trước hoàn thành
  // Thực ra: hoàn sau khi hoàn thành. Hai lần succeeded = 80.000đ (refund 1: 50000, refund 2: 30000).
  // Phí hoàn = 8000, PT giảm 72000.
  {
    id: 'bk-p1-004',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'lan@fitmate.vn',
    memberName: 'Phạm Thị Lan',
    date: daysAgo(20),
    timeSlot: '16:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [
      {
        id: 'rf-p1-004-01',
        bookingId: 'bk-p1-004',
        amount: 50000,
        status: 'succeeded',
        createdAt: isoTime(daysAgo(18)),
        completedAt: isoTime(daysAgo(18)),
      },
      {
        id: 'rf-p1-004-02',
        bookingId: 'bk-p1-004',
        amount: 30000,
        status: 'succeeded',
        createdAt: isoTime(daysAgo(15)),
        completedAt: isoTime(daysAgo(15)),
      },
      {
        id: 'rf-p1-004-03',
        bookingId: 'bk-p1-004',
        amount: 20000,
        status: 'pending',
        createdAt: isoTime(daysAgo(2)),
        completedAt: null,
      },
    ],
  },
  // 5. Đã hoàn thành, hoàn toàn bộ TRƯỚC khi hoàn thành (vẫn ghi nhận 0 thu nhập).
  // Theo chính sách: booking đã thanh toán bị hủy trước khi hoàn thành → hoàn toàn bộ, PT 0.
  // Khi status = 'cancelled' (chứ không phải 'completed'), không tính vào completed.
  // Phí hoàn trả: 50000 (10%). PT nhận 0.
  {
    id: 'bk-p1-005',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'anh@fitmate.vn',
    memberName: 'Nguyễn Tuấn Anh',
    date: daysAgo(10),
    timeSlot: '19:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'cancelled',
    paymentStatus: 'refunded',
    refunds: [
      {
        id: 'rf-p1-005-01',
        bookingId: 'bk-p1-005',
        amount: 500000,
        status: 'succeeded',
        createdAt: isoTime(daysAgo(11)),
        completedAt: isoTime(daysAgo(10)),
      },
    ],
  },
  // 6. Đã thanh toán chờ hoàn thành — booking 2 ngày trước (tương lai nhẹ)
  {
    id: 'bk-p1-006',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'user@fitmate.vn',
    memberName: 'Nguyễn Văn Hùng',
    date: daysAgo(2),
    timeSlot: '09:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'confirmed',
    paymentStatus: 'paid',
    refunds: [],
  },
  // 7. Đã thanh toán chờ hoàn thành — ngày mai
  {
    id: 'bk-p1-007',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'hoa@fitmate.vn',
    memberName: 'Lê Thị Hoa',
    date: daysAgo(0),
    timeSlot: '14:00',
    basePrice: 500000,
    discount: 50000,
    paidAmount: 450000,
    appointmentStatus: 'confirmed',
    paymentStatus: 'paid',
    refunds: [],
  },
  // 8. Booking CHƯA thanh toán
  {
    id: 'bk-p1-008',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'minh@fitmate.vn',
    memberName: 'Trần Quang Minh',
    date: daysAgo(3),
    timeSlot: '10:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'pending',
    paymentStatus: 'unpaid',
    refunds: [],
  },
  // 9. Refund PENDING (chưa thành công → không điều chỉnh)
  {
    id: 'bk-p1-009',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'lan@fitmate.vn',
    memberName: 'Phạm Thị Lan',
    date: daysAgo(25),
    timeSlot: '10:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'completed',
    paymentStatus: 'refunding',
    refunds: [
      {
        id: 'rf-p1-009-01',
        bookingId: 'bk-p1-009',
        amount: 50000,
        status: 'pending',
        createdAt: isoTime(daysAgo(1)),
        completedAt: null,
      },
    ],
  },
  // 10. Refund FAILED (không tính)
  {
    id: 'bk-p1-010',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'anh@fitmate.vn',
    memberName: 'Nguyễn Tuấn Anh',
    date: daysAgo(30),
    timeSlot: '09:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [
      {
        id: 'rf-p1-010-01',
        bookingId: 'bk-p1-010',
        amount: 50000,
        status: 'failed',
        createdAt: isoTime(daysAgo(5)),
        completedAt: null,
      },
    ],
  },
  // 11. Hoàn tiền khác tháng với tháng ghi nhận thu nhập:
  // Booking hoàn thành tháng trước (daysAgo 60), refund succeeded tháng này (daysAgo 5).
  {
    id: 'bk-p1-011',
    ptEmail: 'pt@fitmate.vn',
    memberEmail: 'user@fitmate.vn',
    memberName: 'Nguyễn Văn Hùng',
    date: daysAgo(60),
    timeSlot: '10:00',
    basePrice: 500000,
    discount: 0,
    paidAmount: 500000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [
      {
        id: 'rf-p1-011-01',
        bookingId: 'bk-p1-011',
        amount: 100000,
        status: 'succeeded',
        createdAt: isoTime(daysAgo(10)),
        completedAt: isoTime(daysAgo(5)),
      },
    ],
  },
];

// =======================================================================
// PT 2: Trần Minh Long (ptlong@fitmate.vn) — pending verified, ít booking
// =======================================================================

const p2Bookings: BookingForPT[] = [
  // 1. Đã hoàn thành tuần này
  {
    id: 'bk-p2-001',
    ptEmail: 'ptlong@fitmate.vn',
    memberEmail: 'hoa@fitmate.vn',
    memberName: 'Lê Thị Hoa',
    date: daysAgo(3),
    timeSlot: '07:30',
    basePrice: 400000,
    discount: 0,
    paidAmount: 400000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [],
  },
  // 2. Đã thanh toán, chờ hoàn thành
  {
    id: 'bk-p2-002',
    ptEmail: 'ptlong@fitmate.vn',
    memberEmail: 'lan@fitmate.vn',
    memberName: 'Phạm Thị Lan',
    date: daysAgo(0),
    timeSlot: '09:00',
    basePrice: 400000,
    discount: 20000,
    paidAmount: 380000,
    appointmentStatus: 'confirmed',
    paymentStatus: 'paid',
    refunds: [],
  },
  // 3. Đã hoàn thành với hoàn 50.000đ
  {
    id: 'bk-p2-003',
    ptEmail: 'ptlong@fitmate.vn',
    memberEmail: 'minh@fitmate.vn',
    memberName: 'Trần Quang Minh',
    date: daysAgo(12),
    timeSlot: '09:00',
    basePrice: 400000,
    discount: 0,
    paidAmount: 400000,
    appointmentStatus: 'completed',
    paymentStatus: 'paid',
    refunds: [
      {
        id: 'rf-p2-003-01',
        bookingId: 'bk-p2-003',
        amount: 50000,
        status: 'succeeded',
        createdAt: isoTime(daysAgo(8)),
        completedAt: isoTime(daysAgo(8)),
      },
    ],
  },
];

export const PT_REVENUE_FIXTURES: Record<string, BookingForPT[]> = {
  'pt@fitmate.vn': p1Bookings,
  'ptlong@fitmate.vn': p2Bookings,
};

/**
 * Lấy danh sách booking của PT theo email.
 * Chỉ trả về booking có ptEmail khớp (tách dữ liệu theo PT).
 */
export function getBookingsForPT(ptEmail: string): BookingForPT[] {
  return PT_REVENUE_FIXTURES[ptEmail] ?? [];
}
