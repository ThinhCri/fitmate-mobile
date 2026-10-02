import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getSupportRepository } from '../supportRepository';
import { apiSupportRepository } from '../api/apiSupportRepository';
import { previewSupportRepository } from '../preview/previewSupportRepository';

describe('Support Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('defaults to apiSupportRepository in production mode', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getSupportRepository();
    expect(repo).toBe(apiSupportRepository);
  });

  it('uses previewSupportRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getSupportRepository();
    expect(repo).toBe(previewSupportRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'bad_support';
    expect(() => getSupportRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed in API mode without falling back to preview repository on 500 error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal Server Error' }),
    });
    const previewSpy = vi.spyOn(previewSupportRepository, 'getNotifications');

    await expect(apiSupportRepository.getNotifications()).rejects.toThrow('Internal Server Error');
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('fetches and maps notifications and tickets from API', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/me/notifications')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: 'notif-api-1',
                type: 'booking',
                title: 'Lịch tập xác nhận',
                message: 'PT Hoàng đã xác nhận lịch tập lúc 18:00',
                created_at: '2026-10-02T10:00:00Z',
                read: false,
                payload: { booking_id: 'bk-123' },
              },
            ],
            total: 1,
          }),
        };
      }
      if (url.includes('/support/tickets')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: '550e8400-e29b-41d4-a716-446655440000',
                subject: 'Yêu cầu hỗ trợ thanh toán',
                category: 'booking_dispute',
                status: 'open',
                created_at: '2026-10-01T09:00:00Z',
              },
            ],
            total: 1,
            page: 1,
            page_size: 20,
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    const notifs = await apiSupportRepository.getNotifications();
    expect(notifs).toHaveLength(1);
    expect(notifs[0].id).toBe('notif-api-1');
    expect(notifs[0].category).toBe('booking');
    expect(notifs[0].targetType).toBe('booking');
    expect(notifs[0].targetId).toBe('bk-123');

    const tickets = await apiSupportRepository.getTickets();
    expect(tickets).toHaveLength(1);
    expect(tickets[0].subject).toBe('Yêu cầu hỗ trợ thanh toán');
    expect(tickets[0].category).toBe('booking_dispute');
  });

  it('creates ticket and sends reply via API', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const fetchSpy = vi.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.includes('/reply')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'tk-100',
            messages: [
              {
                id: 'msg-reply-1',
                sender_id: 'user-id',
                is_admin: false,
                content: 'Tôi muốn cập nhật lại thông tin',
                created_at: '2026-10-02T11:00:00Z',
              },
            ],
          }),
        };
      }
      return {
        ok: true,
        status: 201,
        json: async () => ({
          id: '550e8400-e29b-41d4-a716-446655440001',
          user_id: 'user-id',
          subject: 'Lỗi ứng dụng',
          category: 'app_bug',
          priority: 'medium',
          status: 'open',
          created_at: '2026-10-02T10:30:00Z',
          updated_at: '2026-10-02T10:30:00Z',
          messages: [],
        }),
      };
    });
    global.fetch = fetchSpy;

    const ticket = await apiSupportRepository.createTicket({
      subject: 'Lỗi ứng dụng',
      category: 'app_bug',
      message: 'Màn hình bị đơ khi bấm xác nhận',
    });
    expect(ticket.id).toBe('550e8400-e29b-41d4-a716-446655440001');

    const reply = await apiSupportRepository.replyTicket(ticket.id, 'Tôi muốn cập nhật lại thông tin');
    expect(reply.text).toBe('Tôi muốn cập nhật lại thông tin');
    expect(reply.sender).toBe('user');
  });

  it('returns notifications and tickets in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getSupportRepository();

    const notifs = await repo.getNotifications();
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0]).toHaveProperty('title');

    const tickets = await repo.getTickets();
    expect(tickets.length).toBeGreaterThan(0);
    expect(tickets[0]).toHaveProperty('ticketCode');
  });

  it('marks notification as read in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getSupportRepository();

    await repo.markNotificationRead('notif-1');
    const notifs = await repo.getNotifications();
    const target = notifs.find((n) => n.id === 'notif-1');
    expect(target?.isRead).toBe(true);
  });
});
