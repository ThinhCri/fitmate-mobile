import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getSocialRepository } from '../socialRepository';
import { apiSocialRepository } from '../api/apiSocialRepository';
import { previewSocialRepository } from '../preview/previewSocialRepository';

describe('Social Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    vi.restoreAllMocks();
  });

  it('defaults to apiSocialRepository in production mode', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getSocialRepository();
    expect(repo).toBe(apiSocialRepository);
  });

  it('uses previewSocialRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getSocialRepository();
    expect(repo).toBe(previewSocialRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'bad_social';
    expect(() => getSocialRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed in API mode without falling back to preview repository', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const previewSpy = vi.spyOn(previewSocialRepository, 'getFriends');

    await expect(apiSocialRepository.getFriends()).rejects.toThrow(
      'Friends list API endpoint not available'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('returns friends list and conversation in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getSocialRepository();

    const data = await repo.getFriends();
    expect(data.friends.length).toBeGreaterThan(0);
    expect(data.friends[0].relationship).toBe('friend');

    const conv = await repo.getConversation('conv-1');
    expect(conv.id).toBe('conv-1');
    expect(conv.messages.length).toBeGreaterThan(0);
  });

  it('handles sending messages in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getSocialRepository();

    const msg = await repo.sendMessage('conv-1', 'Xin chào!');
    expect(msg.text).toBe('Xin chào!');
    expect(msg.status).toBe('sent');
  });
});
