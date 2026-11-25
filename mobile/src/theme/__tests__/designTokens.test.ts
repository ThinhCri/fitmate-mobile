import { describe, it, expect } from 'vitest';
import { colors, spacing, radius, typography, setAppTheme } from '../designTokens';

describe('Design Tokens Foundation', () => {
  it('defines all required semantic colors with Light mode as default', () => {
    setAppTheme('light');
    expect(colors.primary).toBe('#0F766E');
    expect(colors.primaryDark).toBe('#0A5F59');
    expect(colors.primaryLight).toBe('#D5EFEB');
    expect(colors.success).toBe('#10B981');
    expect(colors.background).toBe('#F8FAFC');
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.textPrimary).toBe('#0F172A');
    expect(colors.danger).toBe('#EF4444');
    expect(colors.warning).toBe('#F59E0B');
  });

  it('switches between light and dark gym obsidian themes dynamically', () => {
    setAppTheme('dark');
    expect(colors.background).toBe('#090D16');
    expect(colors.surface).toBe('#111827');
    expect(colors.textPrimary).toBe('#F8FAFC');
    expect(colors.primaryLight).toBe('#2D1520');

    setAppTheme('light');
    expect(colors.background).toBe('#F8FAFC');
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.textPrimary).toBe('#0F172A');
    expect(colors.primaryLight).toBe('#D5EFEB');
  });

  it('defines spacing scale complying with 4dp/8dp grid', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(12);
    expect(spacing.lg).toBe(16);
    expect(spacing.xxl).toBe(24);
    expect(spacing.xxxl).toBe(32);
  });

  it('defines corner radius scale', () => {
    expect(radius.sm).toBe(8);
    expect(radius.md).toBe(12);
    expect(radius.lg).toBe(16);
    expect(radius.full).toBe(9999);
  });

  it('defines readable typography roles', () => {
    expect(typography.display.fontSize).toBeGreaterThanOrEqual(24);
    expect(typography.title1.fontWeight).toBe('700');
    expect(typography.caption.fontSize).toBe(12);
  });
});
