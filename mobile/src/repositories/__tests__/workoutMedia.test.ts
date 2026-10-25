import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/api/client', async () => {
  const { normalizeApiResourceUrl } = await import('@/services/api/resourceUrl');
  return { apiClient: vi.fn(), resolveApiResourceUrl: (value: string) => normalizeApiResourceUrl(value, 'https://api.fitmate.site/api/v1') };
});
import { apiClient } from '@/services/api/client';
import { ApiWorkoutRepository } from '../api/apiWorkoutRepository';

beforeEach(() => vi.clearAllMocks());

describe('workout image adapters', () => {
  it('resolves both catalog poses for a physical device', async () => {
    vi.mocked(apiClient).mockResolvedValue({ items: [{ id: 'plank', slug: 'Plank', name_vi: 'Plank', name_en: 'Plank',
      image_start_url: '/uploads/Plank/0.jpg?sig=abc', image_end_url: 'http://localhost:5116/uploads/Plank/1.jpg?sig=xyz' }] });
    const [item] = await new ApiWorkoutRepository().listExerciseCatalog();
    expect(item.imageStartUrl).toBe('https://api.fitmate.site/uploads/Plank/0.jpg?sig=abc');
    expect(item.imageEndUrl).toBe('https://api.fitmate.site/uploads/Plank/1.jpg?sig=xyz');
  });
  it('also resolves the media URL retained on an existing plan', async () => {
    vi.mocked(apiClient).mockResolvedValue({ id: 'plan', exercises: [{ id: 'ex', name: 'Plank', media_url: '/uploads/Plank/0.jpg?sig=abc' }] });
    const result = await new ApiWorkoutRepository().getPlan('plan');
    expect(result.exercises[0].imageStartUrl).toBe('https://api.fitmate.site/uploads/Plank/0.jpg?sig=abc');
  });
});
