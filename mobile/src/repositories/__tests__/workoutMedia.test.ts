import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/api/client', async () => {
  const { normalizeApiResourceUrl } = await import('@/services/api/resourceUrl');
  return { apiClient: vi.fn(), resolveApiResourceUrl: (value: string) => normalizeApiResourceUrl(value, 'https://api.fitmate.site/api/v1') };
});
import { apiClient } from '@/services/api/client';
import { ApiWorkoutRepository } from '../api/apiWorkoutRepository';

beforeEach(() => vi.clearAllMocks());

describe('workout image adapters', () => {
  it('writes a stable catalog identity through the real plan API adapter', async () => {
    vi.mocked(apiClient).mockResolvedValue({ id: 'new-plan' });
    await new ApiWorkoutRepository().createPlan({ title: 'Test', category: 'Mon', durationMinutes: 30,
      exercises: [{ id: 'exercise', name: 'Plank', type: 'time', sets: 3, durationSeconds: 30, restSeconds: 45, caloriesEstimate: 0,
        imageStartUrl: 'https://account.r2.cloudflarestorage.com/bucket/exercise-catalog/Plank/0.jpg?X-Amz-Signature=temporary' }] });
    const [path, options] = vi.mocked(apiClient).mock.calls[0];
    expect(path).toBe('/me/workout/plans');
    expect(JSON.parse(String(options?.body)).exercises[0].media_url).toBe('storage://exercise-catalog/Plank/0.jpg');
  });
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
