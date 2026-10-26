import { describe, expect, it } from 'vitest';
import { mapSettlementStatus } from '../settlementStatus';

describe('financial settlement presentation', () => {
  it('keeps approval separate from a completed bank transfer', () => {
    expect(mapSettlementStatus('approved')).toBe('approved');
    expect(mapSettlementStatus('paid')).toBe('paid_out');
    expect(mapSettlementStatus('on_hold')).toBe('on_hold');
    expect(mapSettlementStatus('pending_review')).toBe('pending');
  });
  it.each(['unpaid', 'partially_paid', '', 'unknown'])('rejects unsupported status %s rather than fabricating a payment state', (status) => {
    expect(() => mapSettlementStatus(status)).toThrow();
  });
});
