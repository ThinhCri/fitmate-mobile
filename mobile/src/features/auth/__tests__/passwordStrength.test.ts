import { describe, expect, it } from 'vitest';
import { assessPasswordStrength } from '../passwordStrength';

describe('password strength guidance', () => {
  it('never rates a too-short mixed password as fairly strong', () => {
    expect(assessPasswordStrength('A1!').score).toBe(1);
    expect(assessPasswordStrength('A1!').text).toContain('Yếu');
  });
  it('explains the existing four strength levels', () => {
    expect(assessPasswordStrength('abcdefghijkl').text).toBe('Yếu');
    expect(assessPasswordStrength('abcdefghijk1').text).toBe('Trung bình');
    expect(assessPasswordStrength('Abcdefghijk1').text).toBe('Khá');
    expect(assessPasswordStrength('Abcdefghijk1!').text).toBe('Mạnh');
  });
  it('does not rate an over-limit password as strong', () => {
    expect(assessPasswordStrength('A1!' + 'x'.repeat(128)).score).toBe(0);
  });
});
