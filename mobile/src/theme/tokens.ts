/**
 * Design tokens — Soft Energy (light theme only).
 *
 * Source of truth:
 * - docs/mobile-redesign/decisions.md  (DEC-019, DEC-020, DEC-023)
 * - docs/mobile-redesign/design-system.md  (Section 2)
 *
 * Token values are verified per-pair by WCAG 2.1 relative luminance in
 * design-system.md. Re-verify with WebAIM / Material Theme Builder when
 * shipping.
 *
 * DEC-023 (2026-09-18):
 *   Bo sac kem/nga vang. Page bg chuyen sang cool white (xanh lanh) va
 *   container tiers pha teal rat nhe. Homepage dung gradient mint teal.
 *
 * DO NOT:
 *  - Import any CSS variable from web src/index.css (DEC-004).
 *  - Hardcode hex inline in components — extend this file instead.
 *  - Add a dark theme variant — phase UI is light-only.
 */

export const palette = {
  // Surface tiers — DEC-023: cool white + mint teal tint (no warm cream).
  surface: '#F5F8F8',            // page bg — cool off-white, slight teal tint
  surfaceContainerLowest: '#FFFFFF', // cards / sheets body (pure white)
  surfaceContainerLow: '#ECF1F0',    // subtle card — very light cool mint
  surfaceContainer: '#E1E9E8',       // selected / segmented inner
  surfaceContainerHigh: '#D5DEDF',    // hover / pressed
  surfaceContainerHighest: '#C6D2D1', // divider tint

  // Text on surface
  onSurface: '#0F1A19',          // near-black with cool teal undertone
  onSurfaceVariant: '#3F4948',   // secondary text
  onSurfaceDisabled: '#8B9492',  // AA-large/UI only — placeholder + caption only

  // Outline
  outline: '#46514F',            // hairline / focus ring (AAA UI)
  outlineVariant: '#7C8784',     // card subtle border 1dp (AA-large/UI 3:1+)

  // Primary (deep teal — sole CTA color)
  primary: '#0F766E',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D5EFEB',
  onPrimaryContainer: '#0A3D38',

  // Secondary (warm sienna — restrained, streak warm accent)
  secondary: '#7C2D12',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FFE7D6',
  onSecondaryContainer: '#3A1606',

  // Tertiary (violet — only for achievements / PT verified)
  tertiary: '#9333EA',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F3E8FF',
  onTertiaryContainer: '#4A1A75',

  // Error / Success / Warning / Info
  error: '#B91C1C',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#5A0F0F',

  success: '#15803D',
  warning: '#B45309',
  info: '#1D4ED8',

  // Backdrop
  scrim: '#000000', // used at 35% opacity for modal/sheet backdrop

  // Inverse (reserved — not used in phase UI)
  inverseSurface: '#0F1A19',
  inverseOnSurface: '#F5F8F8',

  // DEC-023: Homepage gradient stops (mint teal cool). Dung cho bg Homepage,
  // KHONG thay the `surface` cho cac man khac.
  gradientMintStart: '#DDEEEC',  // mint pastel
  gradientMintEnd: '#F5F8F8',    // page bg
  gradientTealHaze: '#CFE0DE',   // deeper mint for top-left accent

  // Glass tint cho floating tab bar + hero card. Dung cung hex luc dac,
  // blur se lam mo nen.
  glassSurface: '#FFFFFF',       // glass tint base (mac dinh)
  glassSurfaceAlt: '#F5F8F8',    // glass tint khi nen co gradient

  // Watermark ink (low-opacity logo/text). Rat nhe, phai < 8% alpha.
  watermarkInk: '#0F766E',       // same as primary — opacity controlled at usage
} as const;

export type PaletteKey = keyof typeof palette;

/**
 * Spacing scale (xxs..6xl).
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

export type SpacingKey = keyof typeof spacing;

/**
 * Radius scale (xs..full).
 */
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;

/**
 * Typography — Inter family.
 * Bundle Inter when shipping; for development use system fallback.
 */
export const fontFamily = {
  // System fallback chain; replace with bundled Inter when shipping.
  display: 'Inter_800ExtraBold',
  heading: 'Inter_700Bold',
  title: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  label: 'Inter_500Medium',
} as const;

export const typography = {
  display: {
    large: { fontFamily: fontFamily.display, fontWeight: '800' as const, fontSize: 40, lineHeight: 48 },
    medium: { fontFamily: fontFamily.heading, fontWeight: '700' as const, fontSize: 32, lineHeight: 40 },
    small: { fontFamily: fontFamily.heading, fontWeight: '700' as const, fontSize: 28, lineHeight: 36 },
  },
  headline: {
    large: { fontFamily: fontFamily.heading, fontWeight: '700' as const, fontSize: 24, lineHeight: 32 },
    medium: { fontFamily: fontFamily.heading, fontWeight: '700' as const, fontSize: 20, lineHeight: 28 },
    small: { fontFamily: fontFamily.title, fontWeight: '600' as const, fontSize: 18, lineHeight: 26 },
  },
  title: {
    large: { fontFamily: fontFamily.title, fontWeight: '600' as const, fontSize: 16, lineHeight: 24 },
    medium: { fontFamily: fontFamily.title, fontWeight: '600' as const, fontSize: 14, lineHeight: 20 },
    small: { fontFamily: fontFamily.title, fontWeight: '600' as const, fontSize: 12, lineHeight: 16 },
  },
  body: {
    large: { fontFamily: fontFamily.body, fontWeight: '400' as const, fontSize: 16, lineHeight: 24 },
    medium: { fontFamily: fontFamily.body, fontWeight: '400' as const, fontSize: 14, lineHeight: 20 },
    small: { fontFamily: fontFamily.body, fontWeight: '400' as const, fontSize: 12, lineHeight: 16 },
  },
  label: {
    large: { fontFamily: fontFamily.label, fontWeight: '600' as const, fontSize: 14, lineHeight: 20 },
    medium: { fontFamily: fontFamily.label, fontWeight: '600' as const, fontSize: 12, lineHeight: 16 },
    small: { fontFamily: fontFamily.label, fontWeight: '500' as const, fontSize: 11, lineHeight: 14 },
  },
} as const;

export type TypographyVariant =
  | 'display.large'
  | 'display.medium'
  | 'display.small'
  | 'headline.large'
  | 'headline.medium'
  | 'headline.small'
  | 'title.large'
  | 'title.medium'
  | 'title.small'
  | 'body.large'
  | 'body.medium'
  | 'body.small'
  | 'label.large'
  | 'label.medium'
  | 'label.small';

/**
 * Elevation — light theme prefers subtle shadow + outline.
 * DEC-023: floating tab bar dùng level2; glass hero card dùng level1.
 */
export const elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  level1: {
    shadowColor: '#0F1A19',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#0F1A19',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowColor: '#0F1A19',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  level4: {
    shadowColor: '#0F1A19',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export type ElevationKey = keyof typeof elevation;

/**
 * Opacity scale for disabled / pressed / scrim states.
 */
export const opacity = {
  disabled: 0.38, // label opacity when disabled (alternative to onSurfaceDisabled)
  pressed: 0.88,
  scrim: 0.35, // modal / bottom sheet backdrop
  iconMuted: 0.6,
  watermark: 0.06, // logo/text watermark (rat nhe, khong can nhieu)
  glass: 0.75, // glass surface opacity (de blur noi bat)
} as const;

/**
 * Touch target — minimum 48x48dp.
 */
export const touchTarget = {
  min: 48,
} as const;

/**
 * Full theme object exported for `useTheme()` consumers.
 */
export const tokens = {
  palette,
  spacing,
  radius,
  fontFamily,
  typography,
  elevation,
  opacity,
  touchTarget,
} as const;

export type Tokens = typeof tokens;
