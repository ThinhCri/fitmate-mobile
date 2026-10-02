import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getWorkoutRepository } from '../workoutRepository';
import { apiWorkoutRepository } from '../api/apiWorkoutRepository';
import { previewWorkoutRepository } from '../preview/previewWorkoutRepository';

describe('Workout Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    vi.restoreAllMocks();
  });

  it('defaults to apiWorkoutRepository in production mode', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getWorkoutRepository();
    expect(repo).toBe(apiWorkoutRepository);
  });

  it('uses previewWorkoutRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getWorkoutRepository();
    expect(repo).toBe(previewWorkoutRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'mock_workout';
    expect(() => getWorkoutRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed in API mode without falling back to preview repository on 500 error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal Server Error' }),
    });
    const previewSpy = vi.spyOn(previewWorkoutRepository, 'getPlan');

    await expect(apiWorkoutRepository.getPlan('plan-1')).rejects.toThrow(
      'Internal Server Error'
    );
    expect(previewSpy).not.toHaveBeenCalled();
    global.fetch = originalFetch;
  });

  it('fails closed on weight records in API mode without fallback on network error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const previewSpy = vi.spyOn(previewWorkoutRepository, 'getWeightRecords');

    await expect(apiWorkoutRepository.getWeightRecords()).rejects.toThrow();
    expect(previewSpy).not.toHaveBeenCalled();
    global.fetch = originalFetch;
  });

  it('returns preview plan and history when preview mode is explicitly active', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getWorkoutRepository();

    const plan = await repo.getPlan('plan-1');
    expect(plan.id).toBe('plan-1');
    expect(plan.exercises.length).toBeGreaterThan(0);

    const history = await repo.getHistory();
    expect(history.sessions.length).toBeGreaterThan(0);
    expect(history.stats.completedCount).toBeGreaterThan(0);
  });

  it('allows adding and deleting weight records in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getWorkoutRepository();

    const newRecord = await repo.addWeightRecord(69.5, 'Test measurement');
    expect(newRecord.weightKg).toBe(69.5);

    const weights = await repo.getWeightRecords();
    expect(weights.records[0].weightKg).toBe(69.5);

    await repo.deleteWeightRecord(newRecord.id);
    const updatedWeights = await repo.getWeightRecords();
    expect(updatedWeights.records.find((r) => r.id === newRecord.id)).toBeUndefined();
  });
});
