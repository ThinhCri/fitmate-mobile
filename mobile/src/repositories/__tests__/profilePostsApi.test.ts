import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/api/client', () => ({ apiClient: vi.fn(), apiUploadFile: vi.fn(), ApiError: class extends Error {} }));
vi.mock('@/services/api/authService', () => ({ authService: { getMe: vi.fn() } }));
import { apiClient } from '@/services/api/client';
import { ApiSocialRepository } from '../api/apiSocialRepository';

describe('profile post API pagination', () => {
  beforeEach(() => vi.clearAllMocks());
  it('passes author filter and opaque cursor to the server', async () => {
    vi.mocked(apiClient).mockResolvedValue({ items: [], nextCursor: null });
    const repository = new ApiSocialRepository();
    await repository.listProfilePosts('author-id', 'cursor+/=');
    const url = String(vi.mocked(apiClient).mock.calls[0][0]);
    const query = new URLSearchParams(url.split('?')[1]);
    expect(query.get('author_id')).toBe('author-id');
    expect(query.get('scope')).toBe('friends');
    expect(query.get('cursor')).toBe('cursor+/=');
    expect(query.get('limit')).toBe('20');
  });
  it('rejects a server ignoring author_id instead of displaying other users posts', async () => {
    vi.mocked(apiClient).mockResolvedValue({ items: [{ author_id: 'another-user' }], nextCursor: null });
    await expect(new ApiSocialRepository().listProfilePosts('requested-user')).rejects.toThrow('backend');
  });
  it('propagates network failure instead of reporting an empty profile', async () => {
    vi.mocked(apiClient).mockRejectedValue(new Error('network unavailable'));
    await expect(new ApiSocialRepository().listProfilePosts('author-id')).rejects.toThrow('network unavailable');
  });
});
