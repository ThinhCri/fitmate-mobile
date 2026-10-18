import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { getAccountRepository } from '../accountRepository';
import { getBookingRepository } from '../bookingRepository';
import { getNutritionRepository } from '../nutritionRepository';
import { getSocialRepository } from '../socialRepository';
import { getSupportRepository } from '../supportRepository';
import { getTrainerRepository } from '../trainerRepository';
import { getWorkoutRepository } from '../workoutRepository';
import { apiAccountRepository } from '../api/apiAccountRepository';
import { apiBookingRepository } from '../api/apiBookingRepository';
import { apiNutritionRepository } from '../api/apiNutritionRepository';
import { apiSocialRepository } from '../api/apiSocialRepository';
import { apiSupportRepository } from '../api/apiSupportRepository';
import { apiTrainerRepository } from '../api/apiTrainerRepository';
import { apiWorkoutRepository } from '../api/apiWorkoutRepository';

describe('API-only repository selection', () => {
  it.each([
    [getAccountRepository, apiAccountRepository],
    [getBookingRepository, apiBookingRepository],
    [getNutritionRepository, apiNutritionRepository],
    [getSocialRepository, apiSocialRepository],
    [getSupportRepository, apiSupportRepository],
    [getTrainerRepository, apiTrainerRepository],
    [getWorkoutRepository, apiWorkoutRepository],
  ])('never switches to local fixture data', (getRepository, apiRepository) => {
    const original = process.env.EXPO_PUBLIC_DATA_SOURCE;
    try {
      process.env.EXPO_PUBLIC_DATA_SOURCE = 'preview';
      expect(getRepository()).toBe(apiRepository);
    } finally {
      if (original === undefined) delete process.env.EXPO_PUBLIC_DATA_SOURCE;
      else process.env.EXPO_PUBLIC_DATA_SOURCE = original;
    }
  });
});
