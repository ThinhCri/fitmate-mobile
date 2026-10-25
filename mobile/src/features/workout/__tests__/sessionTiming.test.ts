import { describe, expect, it } from 'vitest';
import { formatWorkoutTimer, isValidRestSeconds, restSecondsOrDefault, restoredCountdown } from '../sessionTiming';

describe('active workout countdown boundaries', () => {
  it('rejects huge rest values but preserves zero rest', () => {
    expect(isValidRestSeconds(45_000_000)).toBe(false);
    expect(restSecondsOrDefault(45_000_000)).toBe(45);
    expect(restSecondsOrDefault(0)).toBe(0);
    expect(restSecondsOrDefault(600)).toBe(600);
    expect(restSecondsOrDefault(NaN)).toBe(45);
    expect(restSecondsOrDefault('45')).toBe(45);
  });
  it('repairs an old invalid checkpoint to the current phase duration', () => {
    expect(restoredCountdown(44_999_997, 45)).toBe(45);
    expect(restoredCountdown(12, 45)).toBe(12);
    expect(restoredCountdown(-3, 45)).toBe(0);
    expect(restoredCountdown(Infinity, 45)).toBe(45);
  });
  it('formats whole seconds and hours without decimal seconds or NaN', () => {
    expect(formatWorkoutTimer(45)).toBe('00:45');
    expect(formatWorkoutTimer(65.9)).toBe('01:05');
    expect(formatWorkoutTimer(3601)).toBe('01:00:01');
    expect(formatWorkoutTimer(NaN)).toBe('--:--');
  });
});
