import { describe, it, expect } from 'vitest';
import { DayNutritionSummaryViewModel } from '../nutritionTypes';

describe('Nutrition Logic and Calculations', () => {
  const sampleSummary: DayNutritionSummaryViewModel = {
    dateString: '2026-09-28',
    dateDisplay: 'Thứ Hai, 28/09/2026',
    isToday: true,
    calories: {
      consumed: 1450,
      target: 2000,
      burnedExercise: 250,
    },
    macros: {
      protein: { current: 110, target: 140 },
      carbs: { current: 165, target: 220 },
      fat: { current: 42, target: 65 },
    },
    meals: [],
  };

  it('calculates remaining calories correctly without negative clamp', () => {
    const remaining = sampleSummary.calories.target - sampleSummary.calories.consumed;
    expect(remaining).toBe(550);
  });

  it('calculates calorie ratio accurately', () => {
    const ratio = (sampleSummary.calories.consumed / sampleSummary.calories.target) * 100;
    expect(ratio).toBeCloseTo(72.5, 1);
  });

  it('calculates protein adherence correctly', () => {
    const proteinRatio =
      (sampleSummary.macros.protein.current / sampleSummary.macros.protein.target) * 100;
    expect(proteinRatio).toBeCloseTo(78.57, 1);
  });
});
