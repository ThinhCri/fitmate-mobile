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

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
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

  it('fails closed in API mode without falling back to preview repository', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const previewSpy = vi.spyOn(previewSupportRepository, 'getNotifications');

    await expect(apiSupportRepository.getNotifications()).rejects.toThrow(
      'Notifications API endpoint not available'
    );
    expect(previewSpy).not.toHaveBeenCalled();
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
