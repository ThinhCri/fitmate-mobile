/**
 * BMI / BMR / TDEE calculator — giong web (App.jsx + UserProfile.jsx).
 *
 * Updated 2026-09-17: tham khao WHO Asian cutoffs:
 *   underweight <18.5, normal 18.5-22.9, overweight 23-24.9, obese >=25.
 */

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BmiResult {
  value: number;
  category: BmiCategory;
  label: string;
  color: 'success' | 'warning' | 'error' | 'info';
}

export function calculateBmi(heightCm: number, weightKg: number): BmiResult {
  if (!heightCm || !weightKg) {
    return { value: 0, category: 'normal', label: '—', color: 'info' };
  }
  const meters = heightCm / 100;
  const value = weightKg / (meters * meters);
  let category: BmiCategory;
  let label: string;
  let color: BmiResult['color'];
  if (value < 18.5) {
    category = 'underweight';
    label = 'Thiếu cân';
    color = 'info';
  } else if (value < 23) {
    category = 'normal';
    label = 'Bình thường';
    color = 'success';
  } else if (value < 25) {
    category = 'overweight';
    label = 'Thừa cân';
    color = 'warning';
  } else {
    category = 'obese';
    label = 'Béo phì';
    color = 'error';
  }
  return { value, category, label, color };
}

/** Mifflin-St Jeor BMR. */
export function calculateBmr(weightKg: number, heightCm: number, age: number, gender: 'Nam' | 'Nữ' | 'Khác'): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'Nữ' ? base - 161 : base + 5;
}

/** Activity multipliers for TDEE. */
const ACTIVITY = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY;

export function calculateTdee(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY[level]);
}

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export function defaultMacroTargets(tdee: number, goal: 'lose' | 'maintain' | 'gain'): MacroTargets {
  let calories = tdee;
  if (goal === 'lose') calories -= 400;
  if (goal === 'gain') calories += 300;

  // 30% protein, 40% carbs, 30% fat (split có the thay doi theo goal sau).
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.3) / 9);
  return { calories, protein, carbs, fat };
}
