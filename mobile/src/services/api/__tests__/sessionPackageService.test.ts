import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../client';
import { sessionPackageService } from '../sessionPackageService';

vi.mock('../client', () => ({ apiClient: vi.fn() }));

describe('sessionPackageService (MOB-802)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('uses server pagination and separates member/PT lists', async () => {
    vi.mocked(apiClient).mockResolvedValue({ items: [], total: 0, page: 2, page_size: 25 });
    await sessionPackageService.listMine(2);
    expect(apiClient).toHaveBeenCalledWith('/me/session-packages?page=2&pageSize=25');
    await sessionPackageService.listAssigned(2);
    expect(apiClient).toHaveBeenCalledWith('/me/session-packages/assigned?page=2&pageSize=25');
  });

  it('sends the displayed refund quote and a stable caller key', async () => {
    vi.mocked(apiClient).mockResolvedValue({ id: 'request-1' });
    await sessionPackageService.requestStop('package-1', 'Tôi chuyển nơi làm việc.', 250000, 'same-request-key');
    expect(apiClient).toHaveBeenCalledWith('/me/session-packages/package-1/stop-requests', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'same-request-key' },
      body: JSON.stringify({ reason: 'Tôi chuyển nơi làm việc.', expected_refund_quote_vnd: 250000 }),
    });
  });

  it('addresses PT acceptance and member withdrawal by package/request ID', async () => {
    vi.mocked(apiClient).mockResolvedValue({ id: 'request-1' });
    await sessionPackageService.acceptStop('package-1', 'accept-key-123');
    expect(apiClient).toHaveBeenCalledWith('/me/session-packages/package-1/stop-requests/accept', {
      method: 'POST', headers: { 'Idempotency-Key': 'accept-key-123' },
    });
    await sessionPackageService.withdrawStop('package-1', 'request-1', 'withdraw-key-123');
    expect(apiClient).toHaveBeenCalledWith('/me/session-packages/package-1/stop-requests/request-1/withdraw', {
      method: 'POST', headers: { 'Idempotency-Key': 'withdraw-key-123' },
    });
  });
});
