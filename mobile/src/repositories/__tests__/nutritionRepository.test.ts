import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getNutritionRepository } from '../nutritionRepository';
import { apiNutritionRepository } from '../api/apiNutritionRepository';
import { previewNutritionRepository } from '../preview/previewNutritionRepository';

describe('Nutrition Repository & Data Source Isolation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_DATA_SOURCE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = originalEnv;
    vi.restoreAllMocks();
  });

  it('defaults to apiNutritionRepository in production mode', () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const repo = getNutritionRepository();
    expect(repo).toBe(apiNutritionRepository);
  });

  it('uses previewNutritionRepository ONLY when EXPO_PUBLIC_DATA_SOURCE is "preview"', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getNutritionRepository();
    expect(repo).toBe(previewNutritionRepository);
  });

  it('fails closed when an unrecognized data source is configured', () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'bad_nutrition';
    expect(() => getNutritionRepository()).toThrow('Cấu hình nguồn dữ liệu không hợp lệ');
  });

  it('fails closed in API mode without falling back to preview repository on 500 error', async () => {
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal Server Error' }),
    });
    const previewSpy = vi.spyOn(previewNutritionRepository, 'getDaySummary');

    await expect(apiNutritionRepository.getDaySummary()).rejects.toThrow(
      'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
    );
    expect(previewSpy).not.toHaveBeenCalled();
    global.fetch = originalFetch;
  });

  it('returns preview summary and weekly menu in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getNutritionRepository();

    const summary = await repo.getDaySummary();
    expect(summary.dateString).toBeDefined();
    expect(summary.calories.target).toBe(2000);
    expect(summary.meals.length).toBeGreaterThan(0);

    const menu = await repo.getWeeklyMenu('2026-09-28');
    expect(menu.length).toBeGreaterThan(0);
  });

  it('allows adding and deleting food items in preview mode', async () => {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
    const repo = getNutritionRepository();

    const created = await repo.addFoodItem({
      name: 'Trứng gà luộc',
      portion: '2 quả (100g)',
      calories: 140,
      proteinGrams: 12,
      carbsGrams: 1,
      fatGrams: 10,
      source: 'manual',
      mealSlot: 'breakfast',
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Trứng gà luộc');

    await repo.deleteFoodItem(created.id);
  });
});
