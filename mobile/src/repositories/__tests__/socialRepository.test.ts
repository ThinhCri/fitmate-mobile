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
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    global.fetch = originalFetch;
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

  it('fails closed in API mode without falling back to preview repository on network failure', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal Server Error' }),
    });
    const previewSpy = vi.spyOn(previewSocialRepository, 'getFriends');

    await expect(apiSocialRepository.getFriends()).rejects.toThrow('Internal Server Error');
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('fetches and maps friends, pending and sent requests from API', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/social/friends/requests?type=incoming')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: 'req-inc-1',
                sender_id: 'user-sender-uuid',
                recipient_id: 'me-uuid',
                status: 'pending',
                created_at: '2026-10-01T10:00:00Z',
              },
            ],
          }),
        };
      }
      if (url.includes('/social/friends/requests?type=outgoing')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: 'req-out-1',
                sender_id: 'me-uuid',
                recipient_id: 'user-recip-uuid',
                status: 'pending',
                created_at: '2026-10-01T11:00:00Z',
              },
            ],
          }),
        };
      }
      if (url.includes('/social/friends')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: 'friend-1',
                display_name: 'Trần Văn Nam',
                avatar_url: 'https://example.com/avatar.jpg',
                friends_since: '2026-09-01T00:00:00Z',
              },
            ],
          }),
        };
      }
      if (url.includes('/users/suggestions')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 'suggested-user-uuid',
              full_name: 'Lê Minh Anh',
              avatar_url: 'https://example.com/suggested-avatar.jpg',
              role: 'Member',
            },
          ],
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    const result = await apiSocialRepository.getFriends();
    expect(result.friends).toHaveLength(1);
    expect(result.friends[0].name).toBe('Trần Văn Nam');
    expect(result.friends[0].relationship).toBe('friend');

    expect(result.pendingRequests).toHaveLength(1);
    expect(result.pendingRequests[0].id).toBe('req-inc-1');
    expect(result.pendingRequests[0].relationship).toBe('received_request');

    expect(result.sentRequests).toHaveLength(1);
    expect(result.sentRequests[0].id).toBe('req-out-1');
    expect(result.sentRequests[0].relationship).toBe('sent_request');

    expect(result.discoverUsers).toHaveLength(1);
    expect(result.discoverUsers[0]).toMatchObject({
      id: 'suggested-user-uuid',
      name: 'Lê Minh Anh',
      relationship: 'none',
    });
  });

  it('fetches conversation and messages via API', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/messages')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: 'msg-1',
                sender_user_id: 'peer-uuid',
                sender: 'HLV Minh',
                text: 'Chào bạn, hôm nay tập nhé!',
                created_at: '2026-10-02T08:00:00Z',
              },
            ],
          }),
        };
      }
      if (url.includes('/chat/friends/conversations/conv-123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            conversation_id: 'conv-123',
            peer: {
              user_id: 'peer-uuid',
              display_name: 'HLV Minh',
            },
            unread_count: 0,
            last_message_at: '2026-10-02T08:00:00Z',
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    const conv = await apiSocialRepository.getConversation('conv-123');
    expect(conv.id).toBe('conv-123');
    expect(conv.participantName).toBe('HLV Minh');
    expect(conv.messages).toHaveLength(1);
    expect(conv.messages[0].text).toBe('Chào bạn, hôm nay tập nhé!');
    expect(conv.messages[0].isSelf).toBe(false);
  });

  it('fetches and maps the production community feed', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'post-uuid',
            author_id: 'author-uuid',
            author: { id: 'author-uuid', display_name: 'Minh Anh' },
            content: 'Buổi tập hôm nay rất tốt.',
            tags: ['workout_exp'],
            visibility: 'public',
            is_knowledge: false,
            reactions_count: 3,
            comments_count: 1,
            created_at: '2026-10-02T08:00:00Z',
          },
        ],
      }),
    });

    const posts = await apiSocialRepository.listPosts('public');
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      id: 'post-uuid',
      authorName: 'Minh Anh',
      category: 'workout_exp',
      commentCount: 1,
    });
  });

  it('sends message via API with idempotent client message id', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'server-msg-1',
        sender_user_id: 'my-uuid',
        sender: 'Tôi',
        text: 'Vâng ạ!',
        created_at: '2026-10-02T08:05:00Z',
        client_message_id: 'msg-client-uuid',
      }),
    });
    global.fetch = fetchSpy;

    const msg = await apiSocialRepository.sendMessage('peer-uuid', 'Vâng ạ!');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/chat/friends/messages'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"peer_user_id":"peer-uuid"'),
      })
    );
    expect(msg.id).toBe('server-msg-1');
    expect(msg.text).toBe('Vâng ạ!');
    expect(msg.isSelf).toBe(true);
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
});
