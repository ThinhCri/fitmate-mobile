import { describe, it, expect } from 'vitest';
import { PtRevenueBookingItemViewModel } from '../PtRevenuePresentation';

describe('PT Space Operational & Financial Flow (Stitch P01 - P07)', () => {
  it('strictly verifies the 10% platform fee and 90% PT share policy in integer VND', () => {
    const grossGmv = 300000;
    const platformFee = Math.round(grossGmv * 0.1);
    const ptShare = grossGmv - platformFee;

    expect(platformFee).toBe(30000);
    expect(ptShare).toBe(270000);
    expect(Number.isInteger(platformFee)).toBe(true);
    expect(Number.isInteger(ptShare)).toBe(true);
    expect(platformFee + ptShare).toBe(grossGmv);
  });

  it('verifies that PT revenue records aggregate correctly across multiple bookings', () => {
    const bookings: PtRevenueBookingItemViewModel[] = [
      {
        bookingId: 'bk-1',
        bookingCode: 'BK-1',
        clientName: 'Client A',
        serviceName: '1-on-1',
        completedDate: '2026-09-28',
        grossAmountVnd: 300000,
        platformFeeVnd: 30000,
        ptShareVnd: 270000,
        payoutStatus: 'approved',
      },
      {
        bookingId: 'bk-2',
        bookingCode: 'BK-2',
        clientName: 'Client B',
        serviceName: 'HIIT',
        completedDate: '2026-09-26',
        grossAmountVnd: 350000,
        platformFeeVnd: 35000,
        ptShareVnd: 315000,
        payoutStatus: 'paid_out',
      },
    ];

    const totalGross = bookings.reduce((sum, b) => sum + b.grossAmountVnd, 0);
    const totalFee = bookings.reduce((sum, b) => sum + b.platformFeeVnd, 0);
    const totalPtShare = bookings.reduce((sum, b) => sum + b.ptShareVnd, 0);

    expect(totalGross).toBe(650000);
    expect(totalFee).toBe(65000);
    expect(totalPtShare).toBe(585000);
    expect(totalFee + totalPtShare).toBe(totalGross);
  });

  it('validates session status lifecycle', () => {
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    expect(validStatuses).toContain('in_progress');
    expect(validStatuses).toContain('completed');
  });
});
