/**
 * Fitmate Mobile Design Tokens
 * Source: Stitch visual specs + system export
 */

export const colors = {
  primary: '#F43F5E',
  primaryDark: '#E11D48',
  primaryLight: '#2D1520',
  secondary: '#3B82F6',
  secondaryLight: '#1E293B',
  background: '#090D16',
  surface: '#111827',
  surfaceSubtle: '#1E293B',
  border: '#1F293D',
  borderSubtle: '#182234',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  danger: '#EF4444',
  dangerLight: '#3B1818',
  warning: '#F59E0B',
  warningLight: '#332308',
  info: '#3B82F6',
  infoLight: '#122038',
  success: '#10B981',
  successLight: '#0B2B20',
  white: '#FFFFFF',
  black: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.75)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  display: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export const designTokens = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
};

export default designTokens;
