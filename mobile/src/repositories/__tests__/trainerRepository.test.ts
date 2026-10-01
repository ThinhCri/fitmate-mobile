import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getTrainerRepository } from '../trainerRepository';
import { apiTrainerRepository } from '../api/apiTrainerRepository';
import { previewTrainerRepository } from '../preview/previewTrainerRepository';
import { trainersService } from '@/services/api/trainersService';
import { ApiError } from '@/services/api/client';

describe('Trainer Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    vi.restoreAllMocks();
  });

  it('defaults to apiTrainerRepository in production mode', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getTrainerRepository();
    expect(repo).toBe(apiTrainerRepository);
  });

  it('uses previewTrainerRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getTrainerRepository();
    expect(repo).toBe(previewTrainerRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'invalid_source';
    expect(() => getTrainerRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed and does NOT fallback to preview repository on API 500 error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    vi.spyOn(trainersService, 'listTrainers').mockRejectedValue(
      new ApiError('Internal Server Error', 500)
    );
    const previewSpy = vi.spyOn(previewTrainerRepository, 'listTrainers');

    await expect(apiTrainerRepository.listTrainers()).rejects.toThrow(
      'Internal Server Error'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('fails closed and does NOT fallback to preview repository on network error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    vi.spyOn(trainersService, 'getTrainer').mockRejectedValue(
      new Error('Network error')
    );
    const previewSpy = vi.spyOn(previewTrainerRepository, 'getTrainer');

    await expect(apiTrainerRepository.getTrainer('pt-123')).rejects.toThrow(
      'Network error'
    );
    expect(previewSpy).not.toHaveBeenCalled();
  });

  it('returns preview trainers in preview mode with correct mapping', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getTrainerRepository();
    const result = await repo.listTrainers({ limit: 5 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toHaveProperty('id');
    expect(result.items[0]).toHaveProperty('name');
    expect(result.items[0]).toHaveProperty('sessionPriceVnd');
  });
});
